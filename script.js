/* ============================================================
   STICK MIND — 3D Particle Head + Institutional UI Engine
   Three.js r128 | GSAP ScrollTrigger | 
   ===========================================Vanilla JS================= */

(function () {
   'use strict';

   var legacyShaders = window.StickMindLegacyShaders || {};

   // ============================================================
   // VERTEX SHADER — Deep Purple Gradient + Backface Culling
   // ============================================================
   const vertexShader = legacyShaders.vertexShader || `
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
   const fragmentShader = legacyShaders.fragmentShader || `
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
   var legacyConfig = window.StickMindLegacy || {};
   var cameraConfig = legacyConfig.camera || {};
   var particleConfig = legacyConfig.particles || {};
   var assetConfig = legacyConfig.assets || {};
   var uniformConfig = legacyConfig.uniforms || {};

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

   var mouseEnabled = false;  // Disabled until entrance animation completes

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
      loadHeadModel();
      setupEvents();
      setupNavigation();
      animate();
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
            onEnter: function () { activateSection(idx); },
            onEnterBack: function () {
               if (idx === 1) {
                  // Scrolling back up from About into Us → detect if user keeps going up
               }
               activateSection(idx);
            }
         });
      });

   }

   function activateSection(idx) {
      if (currentSection === idx) return;
      currentSection = idx;

      // Update nav
      window.StickMindLegacySectionState.setActiveNav(idx);

      // For Home (idx=0) — fully reset camera to initial position
      if (idx === 0) {
         var overlay = document.getElementById('transition-overlay');
         overlay.style.opacity = '0';
         var hdr = document.getElementById('site-header');
         hdr.classList.remove('light-mode');
         hdr.classList.remove('scrolled');
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

      // For Us (idx=1) — light-mode header
      if (idx === 1) {
         var hdr = document.getElementById('site-header');
         hdr.classList.add('light-mode');
         hdr.classList.remove('scrolled');
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

      // For About, Services, Contact — dark glassmorphism header
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

      // Set header same as Home (transparent glass) + remove light-mode
      var overlay = document.getElementById('transition-overlay');
      gsap.to(overlay, { opacity: 0, duration: 0.8, ease: 'power2.out' });
      var hdr = document.getElementById('site-header');
      hdr.classList.remove('light-mode');
      hdr.classList.remove('scrolled');
      if (headPoints) {
         gsap.to(headPoints.material.uniforms.uSize, {
            value: 2.2, duration: 1.0, ease: 'power2.out'
         });
      }

      // Animate section content (skip Services — its chat has its own reveal system)
      if (idx !== 3) {
         var sectionEl = document.querySelectorAll('.section')[idx];
         var content = sectionEl.querySelector('.section-content');
         if (content) {
            gsap.fromTo(content.children,
               { opacity: 0, y: 30 },
               { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out', delay: 0.2 }
            );
         }
      }

      // ── About Section (idx=2): Cascading Counters + Eye-Tracking ──
      if (idx === 2) {
         window.StickMindLegacyAboutSection.play({
            gsap: gsap,
            currentCamState: currentCamState,
            sectionStates: sectionStates,
            viewportWidth: W,
            viewportHeight: H
         });
      }

      // ── Services Section (idx=3): Wheel-driven sequential chat reveal ──
      if (idx === 3) {
         window.StickMindLegacyServicesSection.play({
            gsap: gsap,
            currentCamState: currentCamState,
            sectionStates: sectionStates,
            viewportWidth: W,
            viewportHeight: H,
            container: document.getElementById('scroll-container'),
            getCurrentSection: function () { return currentSection; }
         });
      }

      // ── Contact Section (idx=4): Sequential timeline reveal ──
      if (idx === 4) {
         window.StickMindLegacyContactSection.play({
            gsap: gsap,
            currentCamState: currentCamState,
            sectionStates: sectionStates,
            viewportWidth: W,
            viewportHeight: H
         });
      }
   }

   // ============================================================
   // TYPEWRITER PREPARATION — Split text into per-char spans
   // ============================================================
   function prepareTypewriter(element) {
      var chars = [];
      var html = element.innerHTML.trim();
      element.innerHTML = '';

      var temp = document.createElement('div');
      temp.innerHTML = html;

      function processNode(node, parent) {
         if (node.nodeType === 3) { // Text node
            var text = node.textContent.replace(/\s+/g, ' ');
            for (var i = 0; i < text.length; i++) {
               var span = document.createElement('span');
               span.className = 'type-char';
               span.textContent = text[i];
               parent.appendChild(span);
               chars.push(span);
            }
         } else if (node.nodeType === 1) { // Element node
            var tag = node.tagName.toLowerCase();
            if (tag === 'br') {
               parent.appendChild(document.createElement('br'));
               return;
            }
            var wrapper = document.createElement(tag);
            for (var a = 0; a < node.attributes.length; a++) {
               wrapper.setAttribute(node.attributes[a].name, node.attributes[a].value);
            }
            parent.appendChild(wrapper);
            Array.from(node.childNodes).forEach(function (child) {
               processNode(child, wrapper);
            });
         }
      }

      Array.from(temp.childNodes).forEach(function (node) {
         processNode(node, element);
      });

      return chars;
   }

   // ============================================================
   // ENTRANCE ANIMATION — Typewriter + Eye-Tracking Choreography
   // ============================================================
   function playEntranceAnimation() {
      // ── Prepare: split hero title into individual char spans ──
      var heroTitle = document.querySelector('.hero-title');
      var chars = prepareTypewriter(heroTitle);

      var tl = gsap.timeline({ delay: 0.3 });

      // ── Phase 0: Dismiss loading screen ──
      tl.to('#loading-screen', { opacity: 0, duration: 0.8, ease: 'power2.inOut' })
         .set('#loading-screen', { display: 'none' });

      // ── Phase A: Head rotates from up-right toward text area (lower-left) ──
      tl.to(currentCamState, {
         headOffY: -0.15,   // look toward left (where text will appear)
         headOffX: 0.05,    // look slightly down
         duration: 1.5,
         ease: 'power2.inOut'
      }, '-=0.3');

      // ── Phase A+: Eyebrow fades in ──
      tl.fromTo('#home .section-eyebrow',
         { opacity: 0, y: 20 },
         { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
         '-=0.8'
      );

      // ── Make hero title container visible (chars still hidden by .type-char) ──
      tl.set('.hero-title', { opacity: 1 });

      // ── Phase B: Typewriter with real-time eye-tracking ──
      var counter = { value: 0 };
      var totalChars = chars.length;
      var typeDuration = totalChars * 0.14; // ~140ms per char — calm, sophisticated
      var lastRevealed = -1;

      tl.to(counter, {
         value: totalChars,
         duration: typeDuration,
         ease: 'none',
         onUpdate: function () {
            var idx = Math.min(Math.floor(counter.value), totalChars - 1);

            if (idx > lastRevealed) {
               // Reveal newly typed characters
               for (var i = lastRevealed + 1; i <= idx; i++) {
                  gsap.to(chars[i], {
                     opacity: 1,
                     filter: 'blur(0px)',
                     duration: 0.2,
                     ease: 'power1.out'
                  });
               }
               lastRevealed = idx;

               // Eye-tracking: head follows the current character position
               var rect = chars[idx].getBoundingClientRect();
               var charCenterX = rect.left + rect.width / 2;
               var charCenterY = rect.top + rect.height / 2;

               // Normalize position relative to viewport center
               var normalizedX = (charCenterX - W / 2) / (W / 2);
               var normalizedY = (charCenterY - H / 2) / (H / 2);

               gsap.to(currentCamState, {
                  headOffY: normalizedX * 0.18,    // horizontal gaze
                  headOffX: normalizedY * 0.06,     // subtle vertical gaze
                  duration: 0.8,
                  ease: 'power3.out',
                  overwrite: 'auto'
               });
            }
         }
      });

      // ── Phase C: CTA fades in ──
      tl.fromTo('#hero-cta',
         { opacity: 0, y: 20 },
         { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
         '-=0.3'
      );

      // ── Phase C+: Processing pause — head "thinks" ──
      tl.to({}, { duration: 0.5 });

      // ── Phase C++: Fixation — head settles to center ──
      tl.to(currentCamState, {
         headOffY: 0,
         headOffX: 0,
         duration: 0.8,
         ease: 'power2.out'
      });

      // ── Phase D: Header elements appear ──
      tl.fromTo('.header-logo',
         { opacity: 0, y: -20 },
         { opacity: 1, y: 0, duration: 0.6 }, '-=0.4'
      );
      tl.fromTo('.nav-link',
         { opacity: 0, y: -15 },
         { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 }, '-=0.3'
      );
      tl.fromTo('.header-cta',
         { opacity: 0, y: -15 },
         { opacity: 1, y: 0, duration: 0.4 }, '-=0.2'
      );
      tl.from('.scroll-indicator', { opacity: 0, duration: 1.0 }, '-=0.3');

      // ── Phase E: Release control to mouse + activate cursor spark ──
      tl.call(function () {
         mouseEnabled = true;
         setupCustomCursor();
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
      camera.position.x += (currentCamState.x + (mouseEnabled ? mouseX * 0.05 : 0) - camera.position.x) * 0.03;
      camera.position.y += (currentCamState.y + (mouseEnabled ? -mouseY * 0.05 : 0) - camera.position.y) * 0.03;
      camera.position.z += (currentCamState.z - camera.position.z) * 0.03;

      // Head rotation — mouse follow (only when enabled) + section offset
      var halfW = W / 2, halfH = H / 2;
      targetRotY = (mouseEnabled ? (mouseX / halfW) * 0.7 : 0) + currentCamState.headOffY;
      targetRotX = (mouseEnabled ? (mouseY / halfH) * 0.45 : 0) + currentCamState.headOffX;

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
