(function () {
   'use strict';

   function create(options) {
      var gsap = options.gsap;
      var sectionStates = options.sectionStates;
      var currentCamState = options.currentCamState;
      var sectionState = options.sectionState;

      function getHeadPoints() {
         return options.getHeadPoints ? options.getHeadPoints() : null;
      }

      function getBloomPass() {
         return options.getBloomPass ? options.getBloomPass() : null;
      }

      function getCurrentSection() {
         return options.getCurrentSection ? options.getCurrentSection() : 0;
      }

      function setCurrentSection(index) {
         if (options.setCurrentSection) options.setCurrentSection(index);
      }

      function getViewportWidth() {
         return options.getViewportWidth ? options.getViewportWidth() : window.innerWidth;
      }

      function getViewportHeight() {
         return options.getViewportHeight ? options.getViewportHeight() : window.innerHeight;
      }

      function activate(index) {
         if (getCurrentSection() === index) return;
         setCurrentSection(index);

         sectionState.setActiveNav(index);

         if (index === 0) {
            resetHome();
            return;
         }

         if (index === 1) {
            activateUs();
            return;
         }

         activateDarkSection(index);
      }

      function resetHome() {
         var overlay = document.getElementById('transition-overlay');
         overlay.style.opacity = '0';

         var header = document.getElementById('site-header');
         header.classList.remove('light-mode');
         header.classList.remove('scrolled');

         var headPoints = getHeadPoints();
         if (headPoints) {
            headPoints.material.uniforms.uSize.value = 2.2;
         }

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

         var bloomPass = getBloomPass();
         if (bloomPass) {
            gsap.to(bloomPass, { strength: homeState.bloom, duration: 1.0, ease: 'power2.out' });
         }
      }

      function activateUs() {
         var header = document.getElementById('site-header');
         header.classList.add('light-mode');
         header.classList.remove('scrolled');

         var sectionEl = document.querySelectorAll('.section')[1];
         var content = sectionEl.querySelector('.section-content');
         if (content) {
            gsap.fromTo(content.children,
               { opacity: 0, y: 30 },
               { opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: 'power2.out', delay: 0.3 }
            );
         }
      }

      function activateDarkSection(index) {
         var state = sectionStates[index];
         gsap.to(currentCamState, {
            x: state.camX,
            y: state.camY,
            z: state.camZ,
            headOffY: state.headRotOffsetY,
            headOffX: state.headRotOffsetX,
            duration: 1.5,
            ease: 'power3.inOut'
         });

         var bloomPass = getBloomPass();
         if (bloomPass) {
            gsap.to(bloomPass, { strength: state.bloom, duration: 1.5, ease: 'power2.inOut' });
         }

         var overlay = document.getElementById('transition-overlay');
         gsap.to(overlay, { opacity: 0, duration: 0.8, ease: 'power2.out' });

         var header = document.getElementById('site-header');
         header.classList.remove('light-mode');
         header.classList.remove('scrolled');

         var headPoints = getHeadPoints();
         if (headPoints) {
            gsap.to(headPoints.material.uniforms.uSize, {
               value: 2.2, duration: 1.0, ease: 'power2.out'
            });
         }

         if (index !== 3) {
            animateSectionContent(index);
         }

         activateSectionChoreography(index);
      }

      function animateSectionContent(index) {
         var sectionEl = document.querySelectorAll('.section')[index];
         var content = sectionEl.querySelector('.section-content');
         if (content) {
            gsap.fromTo(content.children,
               { opacity: 0, y: 30 },
               { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out', delay: 0.2 }
            );
         }
      }

      function activateSectionChoreography(index) {
         if (index === 2) {
            window.StickMindLegacyAboutSection.play({
               gsap: gsap,
               currentCamState: currentCamState,
               sectionStates: sectionStates,
               viewportWidth: getViewportWidth(),
               viewportHeight: getViewportHeight()
            });
         }

         if (index === 3) {
            window.StickMindLegacyServicesSection.play({
               gsap: gsap,
               currentCamState: currentCamState,
               sectionStates: sectionStates,
               viewportWidth: getViewportWidth(),
               viewportHeight: getViewportHeight(),
               container: document.getElementById('scroll-container'),
               getCurrentSection: getCurrentSection
            });
         }

         if (index === 4) {
            window.StickMindLegacyContactSection.play({
               gsap: gsap,
               currentCamState: currentCamState,
               sectionStates: sectionStates,
               viewportWidth: getViewportWidth(),
               viewportHeight: getViewportHeight()
            });
         }
      }

      return {
         activate: activate
      };
   }

   window.StickMindLegacySectionActivation = {
      create: create
   };
})();
