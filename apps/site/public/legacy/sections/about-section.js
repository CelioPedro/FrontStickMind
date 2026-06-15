(function () {
   'use strict';

   function play(options) {
      if (window._aboutCountersDone) return;
      window._aboutCountersDone = true;

      var gsap = options.gsap;
      var currentCamState = options.currentCamState;
      var sectionStates = options.sectionStates;
      var viewportWidth = options.viewportWidth;
      var viewportHeight = options.viewportHeight;

      var statEls = document.querySelectorAll('#about-stats .stat');
      var stats = [
         { el: document.getElementById('stat-1'), parent: statEls[0], target: 98, suffix: '%', duration: 1.8 },
         { el: document.getElementById('stat-2'), parent: statEls[1], target: 5, suffix: 'k+', duration: 1.2 },
         { el: document.getElementById('stat-3'), parent: statEls[2], target: 12, suffix: '', duration: 1.4 }
      ];

      var counterTl = gsap.timeline({ delay: 1.2 });
      var cumulativeTime = 0;

      stats.forEach(function (stat) {
         var counter = { value: 0 };

         counterTl.to(stat.parent, {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: 'power2.out'
         }, cumulativeTime);

         counterTl.call(function () {
            var rect = stat.el.getBoundingClientRect();
            var statCenterX = rect.left + rect.width / 2;
            var statCenterY = rect.top + rect.height / 2;
            var normalizedX = (statCenterX - viewportWidth / 2) / (viewportWidth / 2);
            var normalizedY = (statCenterY - viewportHeight / 2) / (viewportHeight / 2);

            gsap.to(currentCamState, {
               headOffY: sectionStates[2].headRotOffsetY + normalizedX * 0.15,
               headOffX: sectionStates[2].headRotOffsetX + normalizedY * 0.08 + 0.15,
               duration: 0.6,
               ease: 'power2.inOut',
               overwrite: 'auto'
            });
         }, null, cumulativeTime);

         counterTl.to(counter, {
            value: stat.target,
            duration: stat.duration,
            ease: 'power2.out',
            onUpdate: function () {
               var val = Math.round(counter.value);
               stat.el.textContent = val + stat.suffix;
            }
         }, cumulativeTime + 0.35);

         cumulativeTime += stat.duration + 0.5;
      });

      counterTl.to(currentCamState, {
         headOffY: sectionStates[2].headRotOffsetY,
         headOffX: sectionStates[2].headRotOffsetX,
         duration: 0.8,
         ease: 'power2.out',
         overwrite: 'auto'
      }, cumulativeTime);
   }

   window.StickMindLegacyAboutSection = {
      play: play
   };
})();
