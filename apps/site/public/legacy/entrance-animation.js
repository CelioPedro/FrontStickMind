(function () {
   'use strict';

   function prepareTypewriter(element) {
      var chars = [];
      var html = element.innerHTML.trim();
      element.innerHTML = '';

      var temp = document.createElement('div');
      temp.innerHTML = html;

      function processNode(node, parent) {
         if (node.nodeType === 3) {
            var text = node.textContent.replace(/\s+/g, ' ');
            for (var i = 0; i < text.length; i++) {
               var span = document.createElement('span');
               span.className = 'type-char';
               span.textContent = text[i];
               parent.appendChild(span);
               chars.push(span);
            }
         } else if (node.nodeType === 1) {
            var tag = node.tagName.toLowerCase();
            if (tag === 'br') {
               parent.appendChild(document.createElement('br'));
               return;
            }

            var wrapper = document.createElement(tag);
            for (var attrIndex = 0; attrIndex < node.attributes.length; attrIndex++) {
               wrapper.setAttribute(node.attributes[attrIndex].name, node.attributes[attrIndex].value);
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

   function play(options) {
      var gsap = options.gsap;
      var currentCamState = options.currentCamState;
      var getViewportWidth = options.getViewportWidth;
      var getViewportHeight = options.getViewportHeight;

      var heroTitle = document.querySelector('.hero-title');
      var chars = prepareTypewriter(heroTitle);
      var initialPresenceHold = options.initialPresenceHold || 1.75;

      var timeline = gsap.timeline({ delay: 0.3 });

      timeline.to('#loading-screen', { opacity: 0, duration: 0.8, ease: 'power2.inOut' })
         .set('#loading-screen', { display: 'none' });

      timeline.to({}, { duration: initialPresenceHold });

      timeline.to(currentCamState, {
         headOffY: -0.15,
         headOffX: 0.05,
         duration: 1.5,
         ease: 'power2.inOut'
      }, '-=0.3');

      timeline.fromTo('#home .section-eyebrow',
         { opacity: 0, y: 20 },
         { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
         '-=0.8'
      );

      timeline.set('.hero-title', { opacity: 1 });

      var counter = { value: 0 };
      var totalChars = chars.length;
      var typeDuration = totalChars * 0.14;
      var lastRevealed = -1;

      timeline.to(counter, {
         value: totalChars,
         duration: typeDuration,
         ease: 'none',
         onUpdate: function () {
            var index = Math.min(Math.floor(counter.value), totalChars - 1);

            if (index > lastRevealed) {
               for (var i = lastRevealed + 1; i <= index; i++) {
                  gsap.to(chars[i], {
                     opacity: 1,
                     filter: 'blur(0px)',
                     duration: 0.2,
                     ease: 'power1.out'
                  });
               }
               lastRevealed = index;

               var rect = chars[index].getBoundingClientRect();
               var charCenterX = rect.left + rect.width / 2;
               var charCenterY = rect.top + rect.height / 2;
               var viewportWidth = getViewportWidth();
               var viewportHeight = getViewportHeight();
               var normalizedX = (charCenterX - viewportWidth / 2) / (viewportWidth / 2);
               var normalizedY = (charCenterY - viewportHeight / 2) / (viewportHeight / 2);

               gsap.to(currentCamState, {
                  headOffY: normalizedX * 0.18,
                  headOffX: normalizedY * 0.06,
                  duration: 0.8,
                  ease: 'power3.out',
                  overwrite: 'auto'
               });
            }
         }
      });

      timeline.fromTo('#hero-cta',
         { opacity: 0, y: 20 },
         { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
         '-=0.3'
      );

      timeline.to({}, { duration: 0.5 });

      timeline.to(currentCamState, {
         headOffY: 0,
         headOffX: 0,
         duration: 0.8,
         ease: 'power2.out'
      });

      timeline.fromTo('.header-logo',
         { opacity: 0, y: -20 },
         { opacity: 1, y: 0, duration: 0.6 }, '-=0.4'
      );
      timeline.fromTo('.nav-link',
         { opacity: 0, y: -15 },
         { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 }, '-=0.3'
      );
      timeline.fromTo('.header-cta',
         { opacity: 0, y: -15 },
         { opacity: 1, y: 0, duration: 0.4 }, '-=0.2'
      );
      timeline.from('.scroll-indicator', { opacity: 0, duration: 1.0 }, '-=0.3');

      timeline.call(function () {
         if (options.onComplete) options.onComplete();
      });
   }

   window.StickMindLegacyEntranceAnimation = {
      play: play
   };
})();
