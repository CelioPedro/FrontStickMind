import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import {
  AdditiveBlending,
  BufferGeometry,
  Clock,
  Color,
  Float32BufferAttribute,
  Object3D,
  PerspectiveCamera,
  PointLight,
  Points,
  Raycaster,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { EffectComposer as Composer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass as SceneRenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass as BloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

import {
  particleFragmentShader,
  particleVertexShader,
} from './particle-shaders';
import { SectionState } from './section-states';
import { computeObjectCentroid, sampleObjectSurface } from './surface-sampler';

export interface ExperienceAssets {
  headModelUrl: string;
  mockVideoUrl: string;
}

export interface ExperienceMountOptions {
  canvasContainer: HTMLElement;
  scrollContainer: HTMLElement;
  assets: ExperienceAssets;
  sectionStates: readonly SectionState[];
  onLoadingProgress?: (state: ExperienceLoadingState) => void;
}

export interface ExperienceLoadingState {
  readonly progress: number;
  readonly label: string;
}

@Injectable({ providedIn: 'root' })
export class ExperienceEngine {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private mounted = false;
  private options?: ExperienceMountOptions;
  private scene?: Scene;
  private camera?: PerspectiveCamera;
  private renderer?: WebGLRenderer;
  private composer?: Composer;
  private bloomPass?: BloomPass;
  private particleMaterial?: ShaderMaterial;
  private headPoints?: Points;
  private cursorLight?: PointLight;
  private clock?: Clock;
  private frameId?: number;
  private mouse3D = new Vector3(0, 0, 0);
  private mouseNorm = new Vector2(0, 0);
  private raycaster = new Raycaster();
  private mouseX = 0;
  private mouseY = 0;
  private width = 1;
  private height = 1;
  private mouseEnabled = false;
  private sectionStates: readonly SectionState[] = [];
  private currentCamState = {
    x: 0,
    y: 0,
    z: 350,
    headOffY: 0.25,
    headOffX: -0.12,
  };
  private readonly uniforms = {
    uTime: { value: 0 },
    uSize: { value: 2.2 },
    uMouse: { value: new Vector3(0, 0, 0) },
    uMouseRadius: { value: 40.0 },
    uMouseForce: { value: 1.8 },
    uBreathing: { value: 0.008 },
  };
  private readonly onResize = () => this.resize();
  private readonly onMouseMove = (event: MouseEvent) => this.trackMouse(event);

  async mount(options: ExperienceMountOptions): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || this.mounted) {
      return;
    }

    this.options = options;
    this.sectionStates = options.sectionStates;
    this.applySectionState(0, 0);
    this.mounted = true;
    this.reportLoading(5, 'Initializing experience...');
    options.canvasContainer.dataset['experienceReady'] = 'pending';

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.clock = new Clock();
    this.createScene(options.canvasContainer);
    this.reportLoading(25, 'Preparing renderer...');
    await this.loadParticleHead(options.assets.headModelUrl);
    this.reportLoading(92, 'Synchronizing interface...');

    window.addEventListener('resize', this.onResize);
    this.document.addEventListener('mousemove', this.onMouseMove);

    options.canvasContainer.dataset['experienceReady'] = 'mounted';
    this.reportLoading(100, 'Ready');
  }

  start(): void {
    if (!this.mounted || !this.options) {
      return;
    }

    this.document.documentElement.dataset['experience'] = 'started';
    this.mouseEnabled = true;
    this.render();
  }

  resize(): void {
    if (!this.mounted || !this.camera || !this.renderer) {
      return;
    }

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
    this.composer?.setSize(this.width, this.height);
  }

  setHomeZoomProgress(progress: number): void {
    const clamped = Math.max(0, Math.min(progress, 1));
    const zoomP =
      clamped < 0.3
        ? (clamped / 0.3) * 0.15
        : 0.15 + ((clamped - 0.3) / 0.7) * 0.85;

    this.currentCamState.z = 350 - 260 * zoomP;

    if (this.bloomPass) {
      this.bloomPass.strength = 2.0 + 2.5 * zoomP;
    }
  }

  activateSection(index: number): void {
    this.applySectionState(index, 1.2);
  }

  setParticleSize(value: number): void {
    this.uniforms.uSize.value = value;
  }

  destroy(): void {
    if (!this.mounted) {
      return;
    }

    if (this.frameId !== undefined) {
      cancelAnimationFrame(this.frameId);
    }

    window.removeEventListener('resize', this.onResize);
    this.document.removeEventListener('mousemove', this.onMouseMove);
    delete this.document.documentElement.dataset['experience'];
    this.options?.canvasContainer.removeAttribute('data-experience-ready');
    this.disposeScene();
    this.options = undefined;
    this.mounted = false;
  }

  private applySectionState(index: number, durationSeconds: number): void {
    const state = this.sectionStates[index];

    if (!state) {
      return;
    }

    if (durationSeconds <= 0) {
      this.currentCamState.x = state.camX;
      this.currentCamState.y = state.camY;
      this.currentCamState.z = state.camZ;
      this.currentCamState.headOffY = state.headRotOffsetY;
      this.currentCamState.headOffX = state.headRotOffsetX;
      if (this.bloomPass) {
        this.bloomPass.strength = state.bloom;
      }
      return;
    }

    this.tweenCameraState(state, durationSeconds);
  }

  private tweenCameraState(state: SectionState, durationSeconds: number): void {
    const start = { ...this.currentCamState };
    const startBloom = this.bloomPass?.strength ?? state.bloom;
    const startTime = performance.now();
    const duration = durationSeconds * 1000;

    const tick = () => {
      if (!this.mounted) {
        return;
      }

      const elapsed = performance.now() - startTime;
      const p = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);

      this.currentCamState.x = this.lerp(start.x, state.camX, eased);
      this.currentCamState.y = this.lerp(start.y, state.camY, eased);
      this.currentCamState.z = this.lerp(start.z, state.camZ, eased);
      this.currentCamState.headOffY = this.lerp(
        start.headOffY,
        state.headRotOffsetY,
        eased,
      );
      this.currentCamState.headOffX = this.lerp(
        start.headOffX,
        state.headRotOffsetX,
        eased,
      );

      if (this.bloomPass) {
        this.bloomPass.strength = this.lerp(startBloom, state.bloom, eased);
      }

      if (p < 1) {
        requestAnimationFrame(tick);
      }
    };

    tick();
  }

  private lerp(start: number, end: number, progress: number): number {
    return start + (end - start) * progress;
  }

  private createScene(canvasContainer: HTMLElement): void {
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(35, this.width / this.height, 1, 2000);
    this.camera.position.set(0, 0, 350);

    this.renderer = new WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(new Color(0x000000), 0);
    canvasContainer.appendChild(this.renderer.domElement);

    this.composer = new Composer(this.renderer);
    this.composer.addPass(new SceneRenderPass(this.scene, this.camera));
    this.bloomPass = new BloomPass(
      new Vector2(this.width, this.height),
      2.0,
      0.6,
      0.15,
    );
    this.composer.addPass(this.bloomPass);

    this.particleMaterial = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });

    this.cursorLight = new PointLight(0xd4b8ff, 1.8, 100);
    this.cursorLight.position.set(0, 0, 50);
    this.scene.add(this.cursorLight);
  }

  private async loadParticleHead(modelUrl: string): Promise<void> {
    if (!this.scene || !this.particleMaterial) {
      return;
    }

    this.reportLoading(45, 'Loading model...');
    const object = await new OBJLoader().loadAsync(modelUrl);
    this.reportLoading(70, 'Building particles...');
    const scale = 9;
    const subdivisions = this.width < 768 ? 12 : 10;
    const centroid = computeObjectCentroid(object, scale);
    const data = sampleObjectSurface(object, scale, subdivisions, centroid);
    const geometry = new BufferGeometry();

    geometry.setAttribute('position', new Float32BufferAttribute(data.positions, 3));
    geometry.setAttribute('aNormal', new Float32BufferAttribute(data.normals, 3));
    geometry.setAttribute('aRandom', new Float32BufferAttribute(data.randoms, 1));
    geometry.computeBoundingBox();

    this.headPoints = new Points(geometry, this.particleMaterial);
    const center = new Vector3();
    geometry.boundingBox?.getCenter(center);
    this.headPoints.position.set(-center.x, -center.y - 15, -center.z);
    this.scene.add(this.headPoints);
    this.disposeLoadedObject(object);
  }

  private reportLoading(progress: number, label: string): void {
    this.options?.onLoadingProgress?.({ progress, label });
  }

  private trackMouse(event: MouseEvent): void {
    if (!this.camera) {
      return;
    }

    const halfW = this.width / 2;
    const halfH = this.height / 2;
    this.mouseX = (event.clientX - halfW) / 2;
    this.mouseY = (event.clientY - halfH) / 2;
    this.mouseNorm.x = (event.clientX / this.width) * 2 - 1;
    this.mouseNorm.y = -(event.clientY / this.height) * 2 + 1;
    this.raycaster.setFromCamera(this.mouseNorm, this.camera);
    this.raycaster.ray.at(350, this.mouse3D);
  }

  private render(): void {
    if (!this.mounted || !this.scene || !this.camera || !this.renderer || !this.clock) {
      return;
    }

    this.frameId = requestAnimationFrame(() => this.render());
    const time = this.clock.getElapsedTime();
    this.uniforms.uTime.value = time;
    this.uniforms.uMouse.value.copy(this.mouse3D);

    this.camera.position.x +=
      (this.currentCamState.x + (this.mouseEnabled ? this.mouseX * 0.05 : 0) -
        this.camera.position.x) *
      0.03;
    this.camera.position.y +=
      (this.currentCamState.y + (this.mouseEnabled ? -this.mouseY * 0.05 : 0) -
        this.camera.position.y) *
      0.03;
    this.camera.position.z +=
      (this.currentCamState.z - this.camera.position.z) * 0.03;

    if (this.headPoints) {
      const targetRotY =
        (this.mouseEnabled ? (this.mouseX / (this.width / 2)) * 0.7 : 0) +
        this.currentCamState.headOffY;
      const targetRotX =
        (this.mouseEnabled ? (this.mouseY / (this.height / 2)) * 0.45 : 0) +
        this.currentCamState.headOffX;

      this.headPoints.rotation.y += (targetRotY - this.headPoints.rotation.y) * 0.03;
      this.headPoints.rotation.x += (targetRotX - this.headPoints.rotation.x) * 0.03;
    }

    if (this.cursorLight) {
      this.cursorLight.position.x += (this.mouse3D.x - this.cursorLight.position.x) * 0.08;
      this.cursorLight.position.y += (this.mouse3D.y - this.cursorLight.position.y) * 0.08;
      this.cursorLight.position.z = 60;
    }

    this.camera.lookAt(this.scene.position);
    this.composer?.render() ?? this.renderer.render(this.scene, this.camera);
  }

  private disposeScene(): void {
    this.scene?.traverse((object) => {
      if (object instanceof Points) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });

    this.renderer?.dispose();
    this.renderer?.domElement.remove();
    this.scene = undefined;
    this.camera = undefined;
    this.renderer = undefined;
    this.composer = undefined;
    this.bloomPass = undefined;
    this.particleMaterial = undefined;
    this.headPoints = undefined;
    this.cursorLight = undefined;
    this.clock = undefined;
    this.frameId = undefined;
    this.mouseEnabled = false;
  }

  private disposeLoadedObject(object: Object3D): void {
    object.traverse((child) => {
      const maybeMesh = child as Object3D & {
        geometry?: BufferGeometry;
        material?: { dispose?: () => void } | Array<{ dispose?: () => void }>;
      };

      maybeMesh.geometry?.dispose();

      if (Array.isArray(maybeMesh.material)) {
        maybeMesh.material.forEach((material) => material.dispose?.());
      } else {
        maybeMesh.material?.dispose?.();
      }
    });
  }
}
