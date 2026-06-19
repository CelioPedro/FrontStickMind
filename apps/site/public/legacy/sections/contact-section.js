(function () {
   'use strict';

   function resetHeadToFront(options) {
      var contactState = options.sectionStates[4] || { camX: 0, camZ: 1 };
      var centerRotation = options.frontRotation || {
         y: Math.atan2(contactState.camX, contactState.camZ),
         x: 0
      };

      options.gsap.to(options.currentCamState, {
         headOffY: centerRotation.y,
         headOffX: centerRotation.x,
         duration: 0.95,
         ease: 'power3.inOut',
         overwrite: 'auto'
      });
   }

   function play(options) {
      if (window._contactAnimDone) {
         resetHeadToFront(options);
         return;
      }
      window._contactAnimDone = true;

      var gsap = options.gsap;
      var currentCamState = options.currentCamState;
      var sectionStates = options.sectionStates;
      var viewportWidth = options.viewportWidth;
      var viewportHeight = options.viewportHeight;

      var ctMilestones = Array.from(document.querySelectorAll('[data-ct]'));
      var ctLine = document.querySelector('.ct-line');
      var totalMilestones = ctMilestones.length;

      if (ctLine) gsap.set(ctLine, { scaleY: 0 });

      gsap.fromTo('.contact-left-header > *',
         { opacity: 0, y: 25 },
         { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out', delay: 0.2 }
      );

      gsap.set('.contact-main > *', { opacity: 0, y: 25 });

      function typewriteElement(el, callback) {
         var fullText = el.textContent;
         el.textContent = '';
         el.style.position = 'relative';
         el.style.opacity = '1';

         var sizer = document.createElement('span');
         sizer.style.visibility = 'hidden';
         sizer.textContent = fullText;
         el.appendChild(sizer);

         var overlay = document.createElement('span');
         overlay.style.position = 'absolute';
         overlay.style.top = '0';
         overlay.style.left = '0';
         overlay.style.width = '100%';
         el.appendChild(overlay);

         var counter = { value: 0 };
         var total = fullText.length;

         gsap.to(counter, {
            value: total,
            duration: total * 0.022,
            ease: 'none',
            onUpdate: function () {
               var count = Math.min(Math.floor(counter.value), total);
               overlay.textContent = fullText.substring(0, count);
            },
            onComplete: function () {
               el.textContent = fullText;
               el.style.position = '';
               if (callback) callback();
            }
         });
      }

      function trackHeadTo(el) {
         var rect = el.getBoundingClientRect();
         var centerX = rect.left + rect.width / 2;
         var centerY = rect.top + rect.height / 2;
         var normalizedX = (centerX - viewportWidth / 2) / (viewportWidth / 2);
         var normalizedY = (centerY - viewportHeight / 2) / (viewportHeight / 2);

         gsap.to(currentCamState, {
            headOffY: sectionStates[4].headRotOffsetY + normalizedX * 0.45,
            headOffX: sectionStates[4].headRotOffsetX + normalizedY * 0.25,
            duration: 0.6,
            ease: 'power2.inOut',
            overwrite: 'auto'
         });
      }

      var milestoneIndex = 0;

      function revealNextMilestone() {
         if (milestoneIndex >= totalMilestones) {
            setTimeout(function () {
               var ctaEl = document.getElementById('contact-cta');
               if (ctaEl) trackHeadTo(ctaEl);

               gsap.to('.contact-main > *', {
                  opacity: 1,
                  y: 0,
                  duration: 0.7,
                  stagger: 0.15,
                  ease: 'power2.out',
                  onComplete: function () {
                     resetHeadToFront(options);
                  }
               });
            }, 300);
            return;
         }

         var milestone = ctMilestones[milestoneIndex];
         var desc = milestone.querySelector('.ct-desc');

         trackHeadTo(milestone);

         gsap.to(milestone, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power3.out'
         });

         gsap.delayedCall(0.4, function () {
            typewriteElement(desc, function () {
               if (milestoneIndex < totalMilestones - 1 && ctLine) {
                  var targetScale = (milestoneIndex + 1) / (totalMilestones - 1);
                  gsap.to(ctLine, {
                     scaleY: Math.min(targetScale, 1),
                     duration: 0.35,
                     ease: 'power2.out',
                     onComplete: function () {
                        milestoneIndex++;
                        revealNextMilestone();
                     }
                  });
               } else {
                  milestoneIndex++;
                  revealNextMilestone();
               }
            });
         });
      }

      setTimeout(function () {
         revealNextMilestone();
      }, 800);
   }

   window.StickMindLegacyContactSection = {
      play: play
   };
})();
