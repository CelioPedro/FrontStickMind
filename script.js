/* ============================================================
   STICK MIND — 3D Particle Head + Institutional UI Engine
   Three.js r128 | GSAP ScrollTrigger | 
   ===========================================Vanilla JS================= */

(function () {
   'use strict';

   var legacyShaders = window.StickMindLegacyShaders;
   if (!legacyShaders || !legacyShaders.vertexShader || !legacyShaders.fragmentShader) {
      throw new Error('StickMindLegacyShaders must be loaded before script.js');
   }

   var vertexShader = legacyShaders.vertexShader;
   var fragmentShader = legacyShaders.fragmentShader;
   // ============================================================
   // STATE & CONFIG
   // ============================================================
   var legacyConfig = window.StickMindLegacy || {};
   var cameraConfig = legacyConfig.camera || {};
   var particleConfig = legacyConfig.particles || {};
   var assetConfig = legacyConfig.assets || {};
   var uniformConfig = legacyConfig.uniforms || {};

   var W = window.innerWidth;
   var H = window.innerHeight;
   var scene, camera, renderer, composer, bloomPass;
   var headPoints = null;
   var cursorLight;
   var renderLoop;
   var currentSection = 0;

   // Camera states per section (Home, Us, About, Services, Contact)
   var sectionStates = cameraConfig.sections || [
      { camX: 0, camY: 0, camZ: 350, headRotOffsetY: 0, headRotOffsetX: 0, bloom: 2.0 },
      { camX: 0, camY: 0, camZ: 60, headRotOffsetY: 0, headRotOffsetX: 0, bloom: 3.5 },
      { camX: 50, camY: 10, camZ: 370, headRotOffsetY: -0.25, headRotOffsetX: 0, bloom: 1.8 },
      { camX: 0, camY: 30, camZ: 320, headRotOffsetY: 0, headRotOffsetX: -0.05, bloom: 2.2 },
      { camX: 150, camY: -5, camZ: 390, headRotOffsetY: -0.2, headRotOffsetX: 0.03, bloom: 1.5 }
   ];
   var currentCamState = Object.assign(
      { x: 0, y: 0, z: 350, headOffY: 0.4, headOffX: -0.2 },
      cameraConfig.initialState
   );

   var particleMaterial;
   var uniforms = {
      uTime: { value: 0 },
      uSize: { value: uniformConfig.size || 2.2 },
      uMouse: { value: new THREE.Vector3(0, 0, 0) },
      uMouseRadius: { value: uniformConfig.mouseRadius || 40.0 },
      uMouseForce: { value: uniformConfig.mouseForce || 1.8 },
      uBreathing: { value: uniformConfig.breathing || 0.008 }
   };

   // ============================================================
   // INIT
   // ============================================================
   function init() {
      gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

      createScene();
      createCursorLight();
      createRenderLoop();
      loadHeadModel();
      renderLoop.setupEvents();
      setupNavigation();
      renderLoop.start();
   }

   // ============================================================
   // SCENE SETUP
   // ============================================================
   function createScene() {
      var runtime = window.StickMindLegacyScene.createScene({
         THREE: THREE,
         width: W,
         height: H,
         container: document.getElementById('canvas-container'),
         uniforms: uniforms,
         vertexShader: vertexShader,
         fragmentShader: fragmentShader
      });

      scene = runtime.scene;
      camera = runtime.camera;
      renderer = runtime.renderer;
      composer = runtime.composer;
      bloomPass = runtime.bloomPass;
      particleMaterial = runtime.particleMaterial;
   }

   // ============================================================
   // CURSOR LIGHT ("The Spark")
   // ============================================================
   function createCursorLight() {
      cursorLight = window.StickMindLegacyScene.createCursorLight({
         THREE: THREE,
         scene: scene
      });
   }

   function createRenderLoop() {
      renderLoop = window.StickMindLegacyRenderLoop.create({
         THREE: THREE,
         width: W,
         height: H,
         scene: scene,
         camera: camera,
         renderer: renderer,
         composer: composer,
         currentCamState: currentCamState,
         getParticleMaterial: function () { return particleMaterial; },
         getHeadPoints: function () { return headPoints; },
         getCursorLight: function () { return cursorLight; },
         onResize: function (width, height) {
            W = width;
            H = height;
         }
      });
   }

   // ============================================================
   // LOAD HEAD MODEL
   // ============================================================
   function loadHeadModel() {
      var progressEl = document.getElementById('loader-progress');
      var textEl = document.getElementById('loader-text');

      window.StickMindLegacyModelLoader.loadHeadModel({
         THREE: THREE,
         modelUrl: assetConfig.headModel || 'assets/models/head.obj',
         onModelLoaded: function (object) {
            textEl.textContent = 'Building particles...';
            progressEl.style.width = '80%';

            setTimeout(function () {
               // Generate particles using the configured density for this viewport.
               var isMobile = W < 768;
               var subs = isMobile
                  ? (particleConfig.mobileSubdivisions || 52)
                  : (particleConfig.desktopSubdivisions || 18);

               var head = window.StickMindLegacyModelLoader.createHeadPoints({
                  THREE: THREE,
                  object: object,
                  sampler: window.StickMindLegacySurfaceSampler,
                  particleMaterial: particleMaterial,
                  centroidScale: 8,
                  modelScale: particleConfig.modelScale || 9,
                  subdivisions: subs
               });

               headPoints = head.headPoints;
               scene.add(headPoints);

               console.log('Particles:', head.particleCount);
               progressEl.style.width = '100%';
               textEl.textContent = 'Ready';

               setTimeout(function () {
                  playEntranceAnimation();
                  setupScrollAnimations();
               }, 300);
            }, 50);
         },
         onProgress: function (xhr) {
            if (xhr.total > 0) {
               var pct = Math.round(xhr.loaded / xhr.total * 70);
               progressEl.style.width = pct + '%';
               textEl.textContent = 'Loading model... ' + pct + '%';
            }
         },
         onError: function (err) {
            console.error('OBJ load error:', err);
            textEl.textContent = 'Error loading model';
         }
      });
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
      var sectionActivation = window.StickMindLegacySectionActivation.create({
         gsap: gsap,
         sectionStates: sectionStates,
         currentCamState: currentCamState,
         sectionState: window.StickMindLegacySectionState,
         getHeadPoints: function () { return headPoints; },
         getBloomPass: function () { return bloomPass; },
         getCurrentSection: function () { return currentSection; },
         setCurrentSection: function (idx) { currentSection = idx; },
         getViewportWidth: function () { return W; },
         getViewportHeight: function () { return H; }
      });

      window.StickMindLegacyHomeTransition.setup({
         gsap: gsap,
         container: container,
         homeSection: homeSection,
         overlay: overlay,
         header: header,
         currentCamState: currentCamState,
         sectionStates: sectionStates,
         sectionState: window.StickMindLegacySectionState,
         getHeadPoints: function () { return headPoints; },
         getBloomPass: function () { return bloomPass; },
         onSectionChange: function (idx) { currentSection = idx; },
         zoomTotal: 800
      });

      // ── Section triggers for Us (scroll-back detection), About, Services, Contact ──
      sections.forEach(function (sec, idx) {
         if (idx === 0) return; // Home handled by wheel interceptor

         ScrollTrigger.create({
            trigger: sec,
            scroller: container,
            start: 'top 60%',
            end: 'bottom 40%',
            onEnter: function () { sectionActivation.activate(idx); },
            onEnterBack: function () {
               if (idx === 1) {
                  // Scrolling back up from About into Us → detect if user keeps going up
               }
               sectionActivation.activate(idx);
            }
         });
      });

   }

   // ============================================================
   // ENTRANCE ANIMATION
   // ============================================================
   function playEntranceAnimation() {
      window.StickMindLegacyEntranceAnimation.play({
         gsap: gsap,
         currentCamState: currentCamState,
         getViewportWidth: function () { return W; },
         getViewportHeight: function () { return H; },
         onComplete: function () {
            renderLoop.setMouseEnabled(true);
            setupCustomCursor();
         }
      });
   }
   // ============================================================
   // NAVIGATION
   // ============================================================
   function setupNavigation() {
      window.StickMindLegacyNavigation.setup({
         gsap: gsap,
         container: document.getElementById('scroll-container'),
         duration: 1.2,
         ease: 'power3.inOut'
      });
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
