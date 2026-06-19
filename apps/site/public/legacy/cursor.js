(function () {
   'use strict';

   function setup(options) {
      if (window.innerWidth < 768) return;

      var gsap = options.gsap;
      var dot = document.getElementById('cursor-dot');
      var glow = document.getElementById('cursor-glow');
      if (!dot || !glow || !gsap) return;

      var state = 'default';
      var xTo = gsap.quickTo(dot, 'left', { duration: 0.08, ease: 'power3.out' });
      var yTo = gsap.quickTo(dot, 'top', { duration: 0.08, ease: 'power3.out' });
      var glowXTo = gsap.quickTo(glow, 'left', { duration: 0.45, ease: 'power4.out' });
      var glowYTo = gsap.quickTo(glow, 'top', { duration: 0.45, ease: 'power4.out' });

      gsap.set([dot, glow], { opacity: 1 });

      function setState(nextState) {
         if (state === nextState) return;
         state = nextState;

         var isInteractive = state === 'interactive';
         var isMagnetic = state === 'magnetic';

         gsap.to(dot, {
            width: isMagnetic ? 6 : 8,
            height: isMagnetic ? 6 : 8,
            opacity: isInteractive || isMagnetic ? 0.75 : 1,
            duration: 0.35,
            ease: 'power3.out'
         });

         gsap.to(glow, {
            width: isMagnetic ? 92 : (isInteractive ? 72 : 48),
            height: isMagnetic ? 92 : (isInteractive ? 72 : 48),
            opacity: isMagnetic ? 0.95 : (isInteractive ? 0.85 : 0.55),
            duration: 0.45,
            ease: 'power4.out'
         });

         document.documentElement.classList.toggle('cursor-interactive', isInteractive || isMagnetic);
         document.documentElement.classList.toggle('cursor-magnetic', isMagnetic);
      }

      function getInteractiveTarget(target) {
         return target.closest('a, button, [role="button"], .video-placeholder, .play-button, .ct-node');
      }

      function getMagneticTarget(target) {
         return target.closest('.cta-button, .header-cta, .contact-cta, .nav-link, .header-logo');
      }

      function moveMagneticTarget(target, event) {
         if (!target) return;

         var rect = target.getBoundingClientRect();
         var dx = event.clientX - (rect.left + rect.width / 2);
         var dy = event.clientY - (rect.top + rect.height / 2);

         gsap.to(target, {
            x: dx * 0.16,
            y: dy * 0.22,
            duration: 0.35,
            ease: 'power3.out',
            overwrite: 'auto'
         });
      }

      function resetMagneticTarget(target) {
         if (!target) return;

         gsap.to(target, {
            x: 0,
            y: 0,
            duration: 0.55,
            ease: 'elastic.out(1, 0.45)',
            overwrite: 'auto'
         });
      }

      var activeMagneticTarget = null;

      document.addEventListener('mousemove', function (event) {
         xTo(event.clientX);
         yTo(event.clientY);
         glowXTo(event.clientX);
         glowYTo(event.clientY);

         var magneticTarget = getMagneticTarget(event.target);
         var interactiveTarget = getInteractiveTarget(event.target);

         if (activeMagneticTarget && activeMagneticTarget !== magneticTarget) {
            resetMagneticTarget(activeMagneticTarget);
         }

         activeMagneticTarget = magneticTarget;
         if (magneticTarget) {
            setState('magnetic');
            moveMagneticTarget(magneticTarget, event);
         } else if (interactiveTarget) {
            setState('interactive');
         } else {
            setState('default');
         }
      });

      document.addEventListener('mouseleave', function () {
         gsap.to([dot, glow], { opacity: 0, duration: 0.2, ease: 'power2.out' });
         resetMagneticTarget(activeMagneticTarget);
         activeMagneticTarget = null;
      });

      document.addEventListener('mouseenter', function () {
         gsap.to([dot, glow], { opacity: 1, duration: 0.25, ease: 'power2.out' });
      });
   }

   window.StickMindLegacyCursor = {
      setup: setup
   };
})();
