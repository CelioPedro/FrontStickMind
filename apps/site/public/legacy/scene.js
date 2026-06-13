(function () {
   'use strict';

   function createScene(options) {
      var THREE = options.THREE;
      var width = options.width;
      var height = options.height;
      var container = options.container;

      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(35, width / height, 1, 2000);
      camera.position.set(0, 0, 350);

      var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      container.appendChild(renderer.domElement);

      var composer = null;
      var bloomPass = null;

      try {
         composer = new THREE.EffectComposer(renderer);
         composer.addPass(new THREE.RenderPass(scene, camera));
         bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(width, height), 2.0, 0.6, 0.15
         );
         composer.addPass(bloomPass);
      } catch (e) {
         console.warn('Bloom not available:', e);
      }

      var particleMaterial = new THREE.ShaderMaterial({
         uniforms: options.uniforms,
         vertexShader: options.vertexShader,
         fragmentShader: options.fragmentShader,
         transparent: true,
         depthWrite: false,
         blending: THREE.AdditiveBlending
      });

      return {
         scene: scene,
         camera: camera,
         renderer: renderer,
         composer: composer,
         bloomPass: bloomPass,
         particleMaterial: particleMaterial
      };
   }

   function createCursorLight(options) {
      var light = new options.THREE.PointLight(0xd4b8ff, 1.8, 100);
      light.position.set(0, 0, 50);
      options.scene.add(light);
      return light;
   }

   window.StickMindLegacyScene = {
      createScene: createScene,
      createCursorLight: createCursorLight
   };
})();
