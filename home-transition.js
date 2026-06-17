(function () {
   'use strict';

   function setup(options) {
      var zoomProgress = 0;
      var zoomActive = true;
      var transitioning = false;
      var hasTransitioned = false;
      var accumulatedDelta = 0;
      var zoomTotal = options.zoomTotal || 800;
      var autoScrollActive = false;
      var autoScrollStartY = 0;
      var autoScrollPointerY = 0;
      var autoScrollFrame = null;
      var suppressMiddleClick = false;

      function getHeadPoints() {
         return options.getHeadPoints ? options.getHeadPoints() : null;
      }

      function getBloomPass() {
         return options.getBloomPass ? options.getBloomPass() : null;
      }

      function setCurrentSection(index) {
         if (options.onSectionChange) options.onSectionChange(index);
         if (options.sectionState) options.sectionState.setActiveNav(index);
      }

      function applyZoomEffects(progress) {
         var zoomP = progress < 0.3
            ? (progress / 0.3) * 0.15
            : 0.15 + ((progress - 0.3) / 0.7) * 0.85;

         options.currentCamState.z = 350 - (260 * zoomP);

         var bloomPass = getBloomPass();
         if (bloomPass) {
            bloomPass.strength = 2.0 + (2.5 * zoomP);
         }

         var contentFade = Math.max(0, 1 - (progress / 0.4));
         var homeContent = options.homeSection.querySelector('.home-content');
         if (homeContent) homeContent.style.opacity = contentFade;

         var scrollIndicator = document.getElementById('scroll-indicator');
         if (scrollIndicator) scrollIndicator.style.opacity = contentFade;
      }

      function canDriveHomeZoom() {
         return zoomActive && !transitioning && !hasTransitioned;
      }

      function stopAutoScroll() {
         if (!autoScrollActive) return;

         autoScrollActive = false;
         if (autoScrollFrame) {
            cancelAnimationFrame(autoScrollFrame);
            autoScrollFrame = null;
         }

         document.documentElement.classList.remove('legacy-autoscroll-active');
         document.removeEventListener('mousemove', onAutoScrollMove);
         document.removeEventListener('mousedown', stopAutoScrollOnPointerDown, true);
         document.removeEventListener('keydown', onAutoScrollKeydown, true);
      }

      function advanceHomeZoom(delta) {
         if (!canDriveHomeZoom()) return;

         accumulatedDelta += delta;
         accumulatedDelta = Math.max(0, accumulatedDelta);
         zoomProgress = Math.min(accumulatedDelta / zoomTotal, 1.0);

         applyZoomEffects(zoomProgress);

         if (zoomProgress >= 1.0 && !transitioning && !hasTransitioned) {
            transitioning = true;
            hasTransitioned = true;
            stopAutoScroll();
            triggerUsTransition();
         }
      }

      function runAutoScrollFrame() {
         if (!autoScrollActive) return;

         var distance = autoScrollPointerY - autoScrollStartY;
         var deadZone = 8;

         if (Math.abs(distance) > deadZone) {
            var cappedDistance = Math.max(-240, Math.min(240, distance));
            advanceHomeZoom(cappedDistance * 0.08);
         }

         autoScrollFrame = requestAnimationFrame(runAutoScrollFrame);
      }

      function onAutoScrollMove(event) {
         autoScrollPointerY = event.clientY;
      }

      function onAutoScrollKeydown(event) {
         if (event.key === 'Escape') stopAutoScroll();
      }

      function stopAutoScrollOnPointerDown(event) {
         if (!autoScrollActive) return;

         event.preventDefault();
         event.stopPropagation();
         stopAutoScroll();
      }

      function startAutoScroll(event) {
         if (event.button !== 1 || !canDriveHomeZoom()) return;

         event.preventDefault();
         event.stopPropagation();

         if (autoScrollActive) return;

         suppressMiddleClick = true;
         autoScrollActive = true;
         autoScrollStartY = event.clientY;
         autoScrollPointerY = event.clientY;

         document.documentElement.classList.add('legacy-autoscroll-active');
         document.addEventListener('mousemove', onAutoScrollMove);
         document.addEventListener('mousedown', stopAutoScrollOnPointerDown, true);
         document.addEventListener('keydown', onAutoScrollKeydown, true);

         if (!autoScrollFrame) runAutoScrollFrame();
      }

      function suppressNativeMiddleClick(event) {
         if (!suppressMiddleClick) return;

         event.preventDefault();
         event.stopPropagation();
         suppressMiddleClick = false;
      }

      function triggerUsTransition() {
         stopAutoScroll();

         var timeline = options.gsap.timeline();
         var headPoints = getHeadPoints();

         if (headPoints) {
            timeline.to(headPoints.material.uniforms.uSize, {
               value: 0, duration: 1.0, ease: 'power2.in'
            }, 0);
         }

         timeline.to(options.overlay, {
            opacity: 1, duration: 1.2, ease: 'power2.inOut'
         }, 0.3);

         timeline.call(function () {
            options.header.classList.add('light-mode');
            options.header.classList.remove('scrolled');
         }, null, 1.2);

         timeline.call(function () {
            options.container.scrollTop = options.homeSection.offsetHeight;
         }, null, 1.3);

         timeline.to(options.overlay, {
            opacity: 0, duration: 1.0, ease: 'power2.out'
         }, 1.5);

         timeline.fromTo('.us-content > *',
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power2.out' },
            1.8
         );

         timeline.call(function () {
            transitioning = false;
            zoomActive = false;
            options.container.style.scrollSnapType = 'y mandatory';
            setCurrentSection(1);
         }, null, 2.2);
      }

      function reverseUsTransition() {
         stopAutoScroll();

         transitioning = true;
         var timeline = options.gsap.timeline();

         timeline.to(options.overlay, {
            opacity: 1, duration: 0.6, ease: 'power2.in'
         }, 0);

         timeline.call(function () {
            options.header.classList.remove('light-mode');

            var headPoints = getHeadPoints();
            if (headPoints) {
               headPoints.material.uniforms.uSize.value = 2.2;
            }

            var homeState = options.sectionStates[0];
            options.currentCamState.x = homeState.camX;
            options.currentCamState.y = homeState.camY;
            options.currentCamState.z = homeState.camZ;
            options.currentCamState.headOffY = homeState.headRotOffsetY;
            options.currentCamState.headOffX = homeState.headRotOffsetX;

            var bloomPass = getBloomPass();
            if (bloomPass) bloomPass.strength = homeState.bloom;

            options.container.scrollTop = 0;
         }, null, 0.5);

         timeline.to(options.overlay, {
            opacity: 0, duration: 0.8, ease: 'power2.out'
         }, 0.7);

         timeline.to('.home-content', { opacity: 1, duration: 0.5 }, 1.0);
         timeline.to('#scroll-indicator', { opacity: 1, duration: 0.5 }, 1.0);

         timeline.call(function () {
            transitioning = false;
            hasTransitioned = false;
            zoomActive = true;
            accumulatedDelta = 0;
            zoomProgress = 0;
            options.container.style.scrollSnapType = 'y proximity';
            setCurrentSection(0);
         }, null, 1.3);
      }

      options.container.addEventListener('wheel', function (event) {
         if (!zoomActive || transitioning) {
            if (transitioning) event.preventDefault();
            return;
         }

         event.preventDefault();
         advanceHomeZoom(event.deltaY);
      }, { passive: false });

      document.addEventListener('mousedown', startAutoScroll, true);
      document.addEventListener('auxclick', suppressNativeMiddleClick, true);
      document.addEventListener('click', suppressNativeMiddleClick, true);

      options.container.addEventListener('scroll', function () {
         if (hasTransitioned && !transitioning && options.container.scrollTop <= 5) {
            reverseUsTransition();
         }
      });
   }

   window.StickMindLegacyHomeTransition = {
      setup: setup
   };
})();
