/* ============================================================
   STICK MIND — 3D Particle Head + Institutional UI Engine
   Three.js r128 | GSAP ScrollTrigger | Vanilla JS
   ============================================================ */

(function () {
   'use strict';

   // ============================================================
   // VERTEX SHADER — Deep Purple Gradient + Backface Culling
   // ============================================================
   const vertexShader = `
precision highp float;

attribute float aSpeed;
attribute float aRandom;
attribute vec3  aNormal;

uniform float uTime;
uniform float uSize;
uniform vec3  uMouse;
uniform float uMouseRadius;
uniform float uMouseForce;
uniform float uBreathing;

varying float vAlpha;
varying float vRandom;
varying float vDepth;
varying float vLighting;

// Simplex 3D noise
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}

float snoise(vec3 v){
   const vec2 C=vec2(1.0/6.0,1.0/3.0);
   const vec4 D=vec4(0.0,0.5,1.0,2.0);
   vec3 i=floor(v+dot(v,C.yyy));
   vec3 x0=v-i+dot(i,C.xxx);
   vec3 g=step(x0.yzx,x0.xyz);
   vec3 l=1.0-g;
   vec3 i1=min(g.xyz,l.zxy);
   vec3 i2=max(g.xyz,l.zxy);
   vec3 x1=x0-i1+C.xxx;
   vec3 x2=x0-i2+C.yyy;
   vec3 x3=x0-D.yyy;
   i=mod289(i);
   vec4 p=permute(permute(permute(
      i.z+vec4(0.0,i1.z,i2.z,1.0))
      +i.y+vec4(0.0,i1.y,i2.y,1.0))
      +i.x+vec4(0.0,i1.x,i2.x,1.0));
   float n_=0.142857142857;
   vec3 ns=n_*D.wyz-D.xzx;
   vec4 j=p-49.0*floor(p*ns.z*ns.z);
   vec4 x_=floor(j*ns.z);
   vec4 y_=floor(j-7.0*x_);
   vec4 x=x_*ns.x+ns.yyyy;
   vec4 y=y_*ns.x+ns.yyyy;
   vec4 h=1.0-abs(x)-abs(y);
   vec4 b0=vec4(x.xy,y.xy);
   vec4 b1=vec4(x.zw,y.zw);
   vec4 s0=floor(b0)*2.0+1.0;
   vec4 s1=floor(b1)*2.0+1.0;
   vec4 sh=-step(h,vec4(0.0));
   vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
   vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
   vec3 p0=vec3(a0.xy,h.x);
   vec3 p1=vec3(a0.zw,h.y);
   vec3 p2=vec3(a1.xy,h.z);
   vec3 p3=vec3(a1.zw,h.w);
   vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
   p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
   vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
   m=m*m;
   return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}

void main(){
   vec3 pos=position;

   // Breathing
   float breathPhase=uTime*1.5;
   float breathCycle=sin(breathPhase)*0.5+0.5;
   float breathScale=1.0+(breathCycle*uBreathing);
   pos*=breathScale;
   pos.y+=breathCycle*2.5;

   // Mouse repulsion
   float distToMouse=distance(pos,uMouse);
   if(distToMouse<uMouseRadius){
      float f=1.0-distToMouse/uMouseRadius;
      f=f*f*f;
      vec3 dir=normalize(pos-uMouse);
      pos+=dir*uMouseForce*f*25.0;
   }

   vec4 mvPosition=modelViewMatrix*vec4(pos,1.0);

   // Backface culling — tight cutoff for corporate look
   vec3 worldNormal=normalize(mat3(modelViewMatrix)*aNormal);
   float facing=dot(worldNormal,vec3(0.0,0.0,1.0));
   float backfaceFade=smoothstep(-0.05,0.15,facing);

   // Depth occlusion
   float zFade=smoothstep(-8.0,8.0,position.z);
   float rimFade=smoothstep(0.0,0.35,facing);

   // Directional light
   vec3 lightDir=normalize(vec3(-0.6,0.4,0.8));
   float diffuse=max(dot(worldNormal,lightDir),0.0);
   vLighting=0.25+diffuse*0.75;

   // Combine
   vAlpha=zFade*backfaceFade*(0.4+0.6*rimFade);
   vRandom=aRandom;
   vDepth=-mvPosition.z;

   // Size attenuation
   float sizeAtten=300.0/-mvPosition.z;
   float randomSize=uSize*(0.8+aRandom*0.4);
   gl_PointSize=randomSize*sizeAtten;
   gl_PointSize=clamp(gl_PointSize,0.5,35.0);

   if(vAlpha<0.005) gl_PointSize=0.0;

   gl_Position=projectionMatrix*mvPosition;
}
`;

   // ============================================================
   // FRAGMENT SHADER — Deep Purple → Lavender Neon Gradient
   // ============================================================
   const fragmentShader = `
precision highp float;

uniform float uTime;

varying float vAlpha;
varying float vRandom;
varying float vDepth;
varying float vLighting;

void main(){
   if(vAlpha<0.01) discard;

   // Matte core + soft glow
   float r=distance(gl_PointCoord,vec2(0.5));
   float core=smoothstep(0.3,0.05,r);
   float glow=smoothstep(0.5,0.15,r);
   float mask=core*0.85+glow*0.35;
   if(mask<0.01) discard;

   // Soft lavender gradient
   vec3 deepPurple=vec3(0.12,0.06,0.22);
   vec3 lavenderNeon=vec3(0.65,0.52,0.85);
   vec3 hotGlow=vec3(0.88,0.78,0.95);

   float brightness=0.55+vRandom*0.15;
   vec3 color=mix(deepPurple,lavenderNeon*brightness*1.6,vLighting);
   color=mix(color,hotGlow,core*0.4*vLighting);
   color*=(0.8+core*0.5);

   float finalAlpha=mask*vAlpha;
   finalAlpha*=smoothstep(600.0,200.0,vDepth);

   gl_FragColor=vec4(color,finalAlpha);
}
`;

   // ============================================================
   // STATE & CONFIG
   // ============================================================
   var W = window.innerWidth;
   var H = window.innerHeight;
   var scene, camera, renderer, composer, bloomPass;
   var headPoints = null;
   var clock = new THREE.Clock();
   var cursorLight;

   var mouse3D = new THREE.Vector3(0, 0, 0);
   var raycaster = new THREE.Raycaster();
   var mouseNorm = new THREE.Vector2(0, 0);
   var mouseScreen = { x: 0, y: 0 };
   var mouseX = 0, mouseY = 0;
   var targetRotY = 0, targetRotX = 0;
   var currentSection = 0;

   // Camera states per section (Home, Us, About, Services, Contact)
   var sectionStates = [
      { camX: 0, camY: 0, camZ: 350, headRotOffsetY: 0, headRotOffsetX: 0, bloom: 2.0 },
      { camX: 0, camY: 0, camZ: 60,  headRotOffsetY: 0, headRotOffsetX: 0, bloom: 3.5 },
      { camX: 50, camY: 10, camZ: 370, headRotOffsetY: -0.25, headRotOffsetX: 0, bloom: 1.8 },
      { camX: 0, camY: 40, camZ: 460, headRotOffsetY: 0.1, headRotOffsetX: -0.05, bloom: 1.5 },
      { camX: 0, camY: 30, camZ: 320, headRotOffsetY: 0, headRotOffsetX: -0.05, bloom: 2.2 }
   ];
   var currentCamState = { x: 0, y: 0, z: 350, headOffY: 0, headOffX: 0 };

   var particleMaterial;
   var uniforms = {
      uTime: { value: 0 },
      uSize: { value: 2.2 },
      uMouse: { value: new THREE.Vector3(0, 0, 0) },
      uMouseRadius: { value: 40.0 },
      uMouseForce: { value: 1.8 },
      uBreathing: { value: 0.008 }
   };

   // ============================================================
   // INIT
   // ============================================================
   function init() {
      gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

      createScene();
      createCursorLight();
      loadHeadModel();
      setupEvents();
      setupCustomCursor();
      setupNavigation();
      animate();
   }

   // ============================================================
   // SCENE SETUP
   // ============================================================
   function createScene() {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(35, W / H, 1, 2000);
      camera.position.set(0, 0, 350);

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(W, H);
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      document.getElementById('canvas-container').appendChild(renderer.domElement);

      // Post-processing
      try {
         composer = new THREE.EffectComposer(renderer);
         composer.addPass(new THREE.RenderPass(scene, camera));
         bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(W, H), 2.0, 0.6, 0.15
         );
         composer.addPass(bloomPass);
      } catch (e) {
         console.warn('Bloom not available:', e);
         composer = null;
      }

      particleMaterial = new THREE.ShaderMaterial({
         uniforms: uniforms,
         vertexShader: vertexShader,
         fragmentShader: fragmentShader,
         transparent: true,
         depthWrite: false,
         blending: THREE.AdditiveBlending
      });
   }

   // ============================================================
   // CURSOR LIGHT ("The Spark")
   // ============================================================
   function createCursorLight() {
      cursorLight = new THREE.PointLight(0xd4b8ff, 1.8, 100);
      cursorLight.position.set(0, 0, 50);
      scene.add(cursorLight);
   }

   // ============================================================
   // SURFACE INTERPOLATION — High-Density Particle Cloud
   // ============================================================
   function interpolateSurface(geometry, scale, subdivisions, centroid) {
      var positions = [], normals = [], speeds = [], randoms = [];
      var posAttr = geometry.getAttribute('position');
      var normAttr = geometry.getAttribute('normal');
      var indexAttr = geometry.index;

      function getVertex(idx) {
         return new THREE.Vector3(
            posAttr.getX(idx) * scale,
            posAttr.getY(idx) * scale,
            posAttr.getZ(idx) * scale
         );
      }
      function getNormal(idx) {
         if (!normAttr) return new THREE.Vector3(0, 0, 1);
         return new THREE.Vector3(
            normAttr.getX(idx), normAttr.getY(idx), normAttr.getZ(idx)
         ).normalize();
      }

      var faceCount = indexAttr ? indexAttr.count / 3 : posAttr.count / 3;

      for (var f = 0; f < faceCount; f++) {
         var ia, ib, ic;
         if (indexAttr) {
            ia = indexAttr.getX(f * 3);
            ib = indexAttr.getX(f * 3 + 1);
            ic = indexAttr.getX(f * 3 + 2);
         } else {
            ia = f * 3; ib = f * 3 + 1; ic = f * 3 + 2;
         }

         var vA = getVertex(ia), vB = getVertex(ib), vC = getVertex(ic);
         var nA = getNormal(ia), nB = getNormal(ib), nC = getNormal(ic);

         // Interior face detection
         var fcx = (vA.x + vB.x + vC.x) / 3;
         var fcy = (vA.y + vB.y + vC.y) / 3;
         var fcz = (vA.z + vB.z + vC.z) / 3;

         var anx = (nA.x + nB.x + nC.x) / 3;
         var any = (nA.y + nB.y + nC.y) / 3;
         var anz = (nA.z + nB.z + nC.z) / 3;
         var anl = Math.sqrt(anx * anx + any * any + anz * anz) || 1;
         anx /= anl; any /= anl; anz /= anl;

         var tcx = centroid.x - fcx, tcy = centroid.y - fcy, tcz = centroid.z - fcz;
         var tcl = Math.sqrt(tcx * tcx + tcy * tcy + tcz * tcz) || 1;
         tcx /= tcl; tcy /= tcl; tcz /= tcl;

         var dot = anx * tcx + any * tcy + anz * tcz;

         if (dot > 0.25) continue;

         var cX = Math.abs(fcx) < 20;
         var mY = fcy > -30 && fcy < 30;
         var bF = fcz < 70;
         var iN = dot > -0.1;
         if (cX && mY && bF && iN) continue;

         // Interpolated surface particles (original vertices removed to avoid bright spots)
         for (var s = 0; s < subdivisions; s++) {
            var r1 = Math.random(), r2 = Math.random();
            if (r1 + r2 > 1) { r1 = 1 - r1; r2 = 1 - r2; }
            var r3 = 1 - r1 - r2;

            var px = vA.x * r1 + vB.x * r2 + vC.x * r3;
            var py = vA.y * r1 + vB.y * r2 + vC.y * r3;
            var pz = vA.z * r1 + vB.z * r2 + vC.z * r3;

            var nx = nA.x * r1 + nB.x * r2 + nC.x * r3;
            var ny = nA.y * r1 + nB.y * r2 + nC.y * r3;
            var nz = nA.z * r1 + nB.z * r2 + nC.z * r3;
            var nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;

            positions.push(px, py, pz);
            normals.push(nx / nl, ny / nl, nz / nl);
            speeds.push(0.5 + Math.random() * 0.5);
            randoms.push(Math.random());
         }
      }

      return { positions: positions, normals: normals, speeds: speeds, randoms: randoms };
   }

   // ============================================================
   // LOAD HEAD MODEL
   // ============================================================
   function loadHeadModel() {
      var progressEl = document.getElementById('loader-progress');
      var textEl = document.getElementById('loader-text');

      var loader = new THREE.OBJLoader();
      loader.load(
         'https://s3-us-west-2.amazonaws.com/s.cdpn.io/40480/head.obj',
         function (object) {
            textEl.textContent = 'Building particles...';
            progressEl.style.width = '80%';

            setTimeout(function () {
               var allPos = [], allNorm = [], allSpd = [], allRnd = [];

               // Compute centroid
               var centroid = new THREE.Vector3();
               var vCount = 0;
               object.traverse(function (child) {
                  if (child instanceof THREE.Mesh) {
                     var pa = child.geometry.getAttribute('position');
                     for (var i = 0; i < pa.count; i++) {
                        centroid.x += pa.getX(i) * 8;
                        centroid.y += pa.getY(i) * 8;
                        centroid.z += pa.getZ(i) * 8;
                        vCount++;
                     }
                  }
               });
               centroid.divideScalar(vCount);

               // Generate particles — 28 subdivisions for extreme density
               var isMobile = W < 768;
               var subs = isMobile ? 52 : 18;

               object.traverse(function (child) {
                  if (child instanceof THREE.Mesh) {
                     var geo = child.geometry;
                     if (!geo.getAttribute('normal')) geo.computeVertexNormals();
                     var data = interpolateSurface(geo, 9, subs, centroid);
                     allPos = allPos.concat(data.positions);
                     allNorm = allNorm.concat(data.normals);
                     allSpd = allSpd.concat(data.speeds);
                     allRnd = allRnd.concat(data.randoms);
                  }
               });

               var geom = new THREE.BufferGeometry();
               geom.setAttribute('position', new THREE.Float32BufferAttribute(allPos, 3));
               geom.setAttribute('aNormal', new THREE.Float32BufferAttribute(allNorm, 3));
               geom.setAttribute('aSpeed', new THREE.Float32BufferAttribute(allSpd, 1));
               geom.setAttribute('aRandom', new THREE.Float32BufferAttribute(allRnd, 1));

               headPoints = new THREE.Points(geom, particleMaterial);
               geom.computeBoundingBox();
               var center = new THREE.Vector3();
               geom.boundingBox.getCenter(center);
               headPoints.position.set(-center.x, -center.y - 15, -center.z);
               scene.add(headPoints);

               console.log('Particles:', allPos.length / 3);
               progressEl.style.width = '100%';
               textEl.textContent = 'Ready';

               setTimeout(function () {
                  playEntranceAnimation();
                  setupScrollAnimations();
               }, 300);
            }, 50);
         },
         function (xhr) {
            if (xhr.total > 0) {
               var pct = Math.round(xhr.loaded / xhr.total * 70);
               progressEl.style.width = pct + '%';
               textEl.textContent = 'Loading model... ' + pct + '%';
            }
         },
         function (err) {
            console.error('OBJ load error:', err);
            textEl.textContent = 'Error loading model';
         }
      );
   }


   // ============================================================
   // CUSTOM CURSOR
   // ============================================================
   function setupCustomCursor() {
      if (W < 768) return;
      var dot = document.getElementById('cursor-dot');
      var glow = document.getElementById('cursor-glow');
      dot.style.opacity = '1';
      glow.style.opacity = '1';

      document.addEventListener('mousemove', function (e) {
         dot.style.left = e.clientX + 'px';
         dot.style.top = e.clientY + 'px';
         gsap.to(glow, { left: e.clientX, top: e.clientY, duration: 0.35, ease: 'power2.out' });
      });
   }

   // ============================================================
   // GSAP SCROLL ANIMATIONS
   // ============================================================
   function setupScrollAnimations() {
      var container = document.getElementById('scroll-container');
      var sections = document.querySelectorAll('.section');
      var homeSection = document.getElementById('home');
      var overlay = document.getElementById('transition-overlay');
      var header = document.getElementById('site-header');

      // ── Zoom state ──
      var zoomProgress = 0;          // 0 → 1
      var zoomActive = true;         // true while on Home, driving zoom
      var transitioning = false;     // true during auto-transition animation
      var hasTransitioned = false;   // true after transition completed
      var ZOOM_TOTAL = 800;          // total wheel delta needed for full zoom
      var accumulatedDelta = 0;

      // ── WHEEL INTERCEPTOR: Drives zoom instead of scrolling ──
      container.addEventListener('wheel', function (e) {
         // Only intercept on Home section during zoom phase
         if (!zoomActive || transitioning) {
            // If transitioning, block ALL scroll
            if (transitioning) {
               e.preventDefault();
            }
            return;
         }

         e.preventDefault(); // Stop native scroll entirely

         // Accumulate wheel delta
         accumulatedDelta += e.deltaY;
         accumulatedDelta = Math.max(0, accumulatedDelta); // Don't go below 0
         zoomProgress = Math.min(accumulatedDelta / ZOOM_TOTAL, 1.0);

         // Apply zoom effects
         applyZoomEffects(zoomProgress);

         // At 100% zoom, trigger transition
         if (zoomProgress >= 1.0 && !transitioning && !hasTransitioned) {
            transitioning = true;
            hasTransitioned = true;
            triggerUsTransition();
         }
      }, { passive: false });

      // ── Apply zoom effects based on progress 0→1 ──
      function applyZoomEffects(p) {
         // Camera zoom: ramp slowly then accelerate
         var zoomP = p < 0.3 ? (p / 0.3) * 0.15 : 0.15 + ((p - 0.3) / 0.7) * 0.85;
         currentCamState.z = 350 - (260 * zoomP);

         // Bloom intensity ramp
         if (bloomPass) {
            bloomPass.strength = 2.0 + (2.5 * zoomP);
         }

         // Fade out home content (first 40% of zoom)
         var contentFade = Math.max(0, 1 - (p / 0.4));
         var homeContent = homeSection.querySelector('.home-content');
         if (homeContent) homeContent.style.opacity = contentFade;
         var scrollInd = document.getElementById('scroll-indicator');
         if (scrollInd) scrollInd.style.opacity = contentFade;
      }

      // ── Auto-transition: overlay → jump to Us → reveal ──
      function triggerUsTransition() {
         var tl = gsap.timeline();

         // 1. Fade particles to nothing
         if (headPoints) {
            tl.to(headPoints.material.uniforms.uSize, {
               value: 0, duration: 1.0, ease: 'power2.in'
            }, 0);
         }

         // 2. Fade overlay to cover everything
         tl.to(overlay, {
            opacity: 1, duration: 1.2, ease: 'power2.inOut'
         }, 0.3);

         // 3. Switch header to light mode
         tl.call(function () {
            header.classList.add('light-mode');
            header.classList.remove('scrolled');
         }, null, 1.2);

         // 4. Jump to Us section (behind overlay)
         tl.call(function () {
            container.scrollTop = homeSection.offsetHeight;
         }, null, 1.3);

         // 5. Fade overlay out to reveal Us section
         tl.to(overlay, {
            opacity: 0, duration: 1.0, ease: 'power2.out'
         }, 1.5);

         // 6. Animate Us content in
         tl.fromTo('.us-content > *',
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power2.out' },
            1.8
         );

         // 7. Unlock scroll, enable snap for sections below, transition done
         tl.call(function () {
            transitioning = false;
            zoomActive = false;
            currentSection = 1;
            // Enable mandatory snap for Us→About→Services→Contact
            container.style.scrollSnapType = 'y mandatory';
            document.querySelectorAll('.nav-link').forEach(function (link) {
               link.classList.toggle('active', parseInt(link.dataset.section) === 1);
            });
         }, null, 2.2);
      }

      // ── Reverse transition (scroll back to Home from Us) ──
      function reverseUsTransition() {
         transitioning = true;
         var tl = gsap.timeline();

         // 1. Overlay covers Us
         tl.to(overlay, {
            opacity: 1, duration: 0.6, ease: 'power2.in'
         }, 0);

         // 2. Restore dark mode, particles, camera (ALL properties)
         tl.call(function () {
            header.classList.remove('light-mode');
            if (headPoints) {
               headPoints.material.uniforms.uSize.value = 2.2;
            }
            // Reset ALL camera to Home defaults
            var homeState = sectionStates[0];
            currentCamState.x = homeState.camX;
            currentCamState.y = homeState.camY;
            currentCamState.z = homeState.camZ;
            currentCamState.headOffY = homeState.headRotOffsetY;
            currentCamState.headOffX = homeState.headRotOffsetX;
            if (bloomPass) bloomPass.strength = homeState.bloom;
            container.scrollTop = 0;
         }, null, 0.5);

         // 3. Reveal Home
         tl.to(overlay, {
            opacity: 0, duration: 0.8, ease: 'power2.out'
         }, 0.7);

         // 4. Restore home content
         tl.to('.home-content', { opacity: 1, duration: 0.5 }, 1.0);
         tl.to('#scroll-indicator', { opacity: 1, duration: 0.5 }, 1.0);

         // 5. Reset state, disable snap
         tl.call(function () {
            transitioning = false;
            hasTransitioned = false;
            zoomActive = true;
            accumulatedDelta = 0;
            zoomProgress = 0;
            currentSection = 0;
            // Disable mandatory snap so Home zoom works freely
            container.style.scrollSnapType = 'y proximity';
            document.querySelectorAll('.nav-link').forEach(function (link) {
               link.classList.toggle('active', parseInt(link.dataset.section) === 0);
            });
         }, null, 1.3);
      }

      // ── Section triggers for Us (scroll-back detection), About, Services, Contact ──
      sections.forEach(function (sec, idx) {
         if (idx === 0) return; // Home handled by wheel interceptor

         ScrollTrigger.create({
            trigger: sec,
            scroller: container,
            start: 'top 60%',
            end: 'bottom 40%',
            onEnter: function () { activateSection(idx); },
            onEnterBack: function () {
               if (idx === 1) {
                  // Scrolling back up from About into Us → detect if user keeps going up
               }
               activateSection(idx);
            }
         });
      });

      // ── Detect scroll back to top (Us → Home reverse) ──
      container.addEventListener('scroll', function () {
         // If on Us section and user scrolls to very top, trigger reverse
         if (hasTransitioned && !transitioning && container.scrollTop <= 5) {
            reverseUsTransition();
         }

         // Header scroll effect
         if (currentSection > 1) {
            if (container.scrollTop > homeSection.offsetHeight + 50) {
               header.classList.add('scrolled');
            }
         }
      });
   }

   function activateSection(idx) {
      if (currentSection === idx) return;
      currentSection = idx;

      // Update nav
      document.querySelectorAll('.nav-link').forEach(function (link) {
         link.classList.toggle('active', parseInt(link.dataset.section) === idx);
      });

      // For Home (idx=0) — fully reset camera to initial position
      if (idx === 0) {
         var overlay = document.getElementById('transition-overlay');
         overlay.style.opacity = '0';
         document.getElementById('site-header').classList.remove('light-mode');
         if (headPoints) {
            headPoints.material.uniforms.uSize.value = 2.2;
         }
         // Reset ALL camera state to Home defaults
         var homeState = sectionStates[0];
         gsap.to(currentCamState, {
            x: homeState.camX,
            y: homeState.camY,
            z: homeState.camZ,
            headOffY: homeState.headRotOffsetY,
            headOffX: homeState.headRotOffsetX,
            duration: 1.0,
            ease: 'power2.out'
         });
         if (bloomPass) {
            gsap.to(bloomPass, { strength: homeState.bloom, duration: 1.0, ease: 'power2.out' });
         }
         return;
      }

      // For Us (idx=1) — scrub handles the transition, just animate content
      if (idx === 1) {
         var sectionEl = document.querySelectorAll('.section')[idx];
         var content = sectionEl.querySelector('.section-content');
         if (content) {
            gsap.fromTo(content.children,
               { opacity: 0, y: 30 },
               { opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: 'power2.out', delay: 0.3 }
            );
         }
         return;
      }

      // For About, Services, Contact — standard camera transition
      var state = sectionStates[idx];
      gsap.to(currentCamState, {
         x: state.camX,
         y: state.camY,
         z: state.camZ,
         headOffY: state.headRotOffsetY,
         headOffX: state.headRotOffsetX,
         duration: 1.5,
         ease: 'power3.inOut'
      });

      if (bloomPass) {
         gsap.to(bloomPass, { strength: state.bloom, duration: 1.5, ease: 'power2.inOut' });
      }

      // Restore dark mode & particles for dark sections
      var overlay = document.getElementById('transition-overlay');
      gsap.to(overlay, { opacity: 0, duration: 0.8, ease: 'power2.out' });
      document.getElementById('site-header').classList.remove('light-mode');
      if (headPoints) {
         gsap.to(headPoints.material.uniforms.uSize, {
            value: 2.2, duration: 1.0, ease: 'power2.out'
         });
      }

      // Animate section content
      var sectionEl = document.querySelectorAll('.section')[idx];
      var content = sectionEl.querySelector('.section-content');
      if (content) {
         gsap.fromTo(content.children,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out', delay: 0.2 }
         );
      }

      // Service cards
      if (idx === 3) {
         gsap.to('.service-card', {
            opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out', delay: 0.3
         });
      }
   }

   // ============================================================
   // ENTRANCE ANIMATION
   // ============================================================
   function playEntranceAnimation() {
      var tl = gsap.timeline({ delay: 0.2 });
      tl.to('#loading-screen', { opacity: 0, duration: 0.8, ease: 'power2.inOut' })
         .set('#loading-screen', { display: 'none' })
         .fromTo('.header-logo', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.3')
         .fromTo('.nav-link', { opacity: 0, y: -15 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 }, '-=0.3')
         .fromTo('.header-cta', { opacity: 0, y: -15 }, { opacity: 1, y: 0, duration: 0.4 }, '-=0.2')
         .from('.section-eyebrow', { opacity: 0, y: 20, duration: 0.6 }, '-=0.2')
         .from('.hero-title', { opacity: 0, y: 30, duration: 0.8, ease: 'power3.out' }, '-=0.3')
         .from('#hero-cta', { opacity: 0, y: 20, duration: 0.5 }, '-=0.3')
         .from('.scroll-indicator', { opacity: 0, duration: 1.2 }, '-=0.2');
   }

   // ============================================================
   // NAVIGATION
   // ============================================================
   function setupNavigation() {
      var container = document.getElementById('scroll-container');

      document.querySelectorAll('.nav-link, .header-logo').forEach(function (link) {
         link.addEventListener('click', function (e) {
            e.preventDefault();
            var href = this.getAttribute('href');
            var target = document.querySelector(href);
            if (target) {
               gsap.to(container, {
                  scrollTo: { y: target, offsetY: 0 },
                  duration: 1.2,
                  ease: 'power3.inOut'
               });
            }
         });
      });

      document.querySelectorAll('.cta-button, .header-cta').forEach(function (btn) {
         btn.addEventListener('click', function (e) {
            var href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
               e.preventDefault();
               var target = document.querySelector(href);
               if (target) {
                  gsap.to(container, {
                     scrollTo: { y: target, offsetY: 0 },
                     duration: 1.2,
                     ease: 'power3.inOut'
                  });
               }
            }
         });
      });
   }

   // ============================================================
   // EVENTS
   // ============================================================
   function setupEvents() {
      document.addEventListener('mousemove', onMouseMove);
      window.addEventListener('resize', onResize);
   }

   function onMouseMove(e) {
      var halfW = W / 2, halfH = H / 2;
      mouseX = (e.clientX - halfW) / 2;
      mouseY = (e.clientY - halfH) / 2;
      mouseScreen.x = e.clientX;
      mouseScreen.y = e.clientY;

      mouseNorm.x = (e.clientX / W) * 2 - 1;
      mouseNorm.y = -(e.clientY / H) * 2 + 1;

      raycaster.setFromCamera(mouseNorm, camera);
      var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      raycaster.ray.intersectPlane(plane, mouse3D);
   }

   function onResize() {
      W = window.innerWidth;
      H = window.innerHeight;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
      if (composer) composer.setSize(W, H);
   }

   // ============================================================
   // RENDER LOOP
   // ============================================================
   function animate() {
      requestAnimationFrame(animate);
      var time = clock.getElapsedTime();

      // Update uniforms
      if (particleMaterial) {
         particleMaterial.uniforms.uTime.value = time;
         particleMaterial.uniforms.uMouse.value.copy(mouse3D);
      }

      // Camera follow from section state
      camera.position.x += (currentCamState.x + mouseX * 0.05 - camera.position.x) * 0.03;
      camera.position.y += (currentCamState.y + -mouseY * 0.05 - camera.position.y) * 0.03;
      camera.position.z += (currentCamState.z - camera.position.z) * 0.03;

      // Head rotation — mouse follow + section offset
      var halfW = W / 2, halfH = H / 2;
      targetRotY = (mouseX / halfW) * 0.7 + currentCamState.headOffY;
      targetRotX = (mouseY / halfH) * 0.45 + currentCamState.headOffX;

      if (headPoints) {
         headPoints.rotation.y += (targetRotY - headPoints.rotation.y) * 0.03;
         headPoints.rotation.x += (targetRotX - headPoints.rotation.x) * 0.03;
      }

      // Cursor light follows mouse with easing
      if (cursorLight) {
         cursorLight.position.x += (mouse3D.x - cursorLight.position.x) * 0.08;
         cursorLight.position.y += (mouse3D.y - cursorLight.position.y) * 0.08;
         cursorLight.position.z = 60;
      }


      camera.lookAt(scene.position);

      if (composer) {
         composer.render();
      } else {
         renderer.render(scene, camera);
      }
   }

   // ============================================================
   // START
   // ============================================================
   if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
   } else {
      init();
   }

})();