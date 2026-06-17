(function () {
   'use strict';

   function play(options) {
      if (window._chatQueueSetup) return;
      window._chatQueueSetup = true;

      var gsap = options.gsap;
      var currentCamState = options.currentCamState;
      var sectionStates = options.sectionStates;
      var viewportWidth = options.viewportWidth;
      var viewportHeight = options.viewportHeight;
      var container = options.container;
      var getCurrentSection = options.getCurrentSection;

      var chatMessages = Array.from(document.querySelectorAll('[data-chat]'));
      var chatIndex = 0;
      var chatTyping = false;

      function revealNextMessage() {
         if (chatIndex >= chatMessages.length || chatTyping) return;
         chatTyping = true;

         var msg = chatMessages[chatIndex];
         chatIndex++;

         var textEl = msg.querySelector('.msg-text');
         var fullText = textEl ? textEl.getAttribute('data-text') || '' : '';

         if (fullText && textEl) {
            textEl.innerHTML = '';
            var sizer = document.createElement('span');
            sizer.className = 'msg-sizer';
            sizer.textContent = fullText;
            var typed = document.createElement('span');
            typed.className = 'msg-typed-overlay';
            textEl.appendChild(sizer);
            textEl.appendChild(typed);
         }

         gsap.set(msg, { visibility: 'visible' });
         gsap.to(msg, {
            y: 0,
            scale: 1,
            duration: 0.5,
            ease: 'power3.out'
         });

         setTimeout(function () {
            var rect = msg.getBoundingClientRect();
            var msgCenterX = rect.left + rect.width / 2;
            var msgCenterY = rect.top + rect.height / 2;
            var normalizedX = (msgCenterX - viewportWidth / 2) / (viewportWidth / 2);
            var normalizedY = (msgCenterY - viewportHeight / 2) / (viewportHeight / 2);

            gsap.to(currentCamState, {
               headOffY: sectionStates[3].headRotOffsetY + normalizedX * 0.12,
               headOffX: sectionStates[3].headRotOffsetX + normalizedY * 0.06 + 0.08,
               duration: 0.6,
               ease: 'power2.inOut',
               overwrite: 'auto'
            });
         }, 50);

         if (fullText && textEl) {
            var typedText = textEl.querySelector('.msg-typed-overlay');
            var typeCounter = { value: 0 };
            var totalChars = fullText.length;
            typedText.classList.add('typing');

            gsap.to(typeCounter, {
               value: totalChars,
               duration: totalChars * 0.025,
               ease: 'none',
               delay: 0.35,
               onUpdate: function () {
                  var count = Math.min(Math.floor(typeCounter.value), totalChars);
                  typedText.textContent = fullText.substring(0, count);
               },
               onComplete: function () {
                  typedText.textContent = fullText;
                  typedText.classList.remove('typing');
                  chatTyping = false;

                  var badge = msg.querySelector('.msg-badge');
                  if (badge) {
                     gsap.to(badge, {
                        opacity: 1, duration: 0.4, delay: 0.15, ease: 'power2.out'
                     });
                  }
               }
            });
         } else {
            chatTyping = false;
         }
      }

      function onChatWheel(event) {
         if (getCurrentSection && getCurrentSection() !== 3) return;

         if (chatIndex >= chatMessages.length && !chatTyping) {
            container.removeEventListener('wheel', onChatWheel, true);
            return;
         }

         event.preventDefault();
         event.stopPropagation();

         if (event.deltaY > 0 && !chatTyping) {
            revealNextMessage();
         }
      }

      container.addEventListener('wheel', onChatWheel, true);

      setTimeout(function () {
         revealNextMessage();
      }, 400);
   }

   window.StickMindLegacyServicesSection = {
      play: play
   };
})();
