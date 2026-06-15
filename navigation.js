(function () {
   'use strict';

   function scrollToTarget(options, href) {
      if (!href || href.charAt(0) !== '#') return false;

      var target = document.querySelector(href);
      if (!target) return false;

      options.gsap.to(options.container, {
         scrollTo: { y: target, offsetY: 0 },
         duration: options.duration,
         ease: options.ease
      });

      return true;
   }

   function setup(options) {
      var linkSelector = options.linkSelector || '.nav-link, .header-logo';
      var ctaSelector = options.ctaSelector || '.cta-button, .header-cta';

      document.querySelectorAll(linkSelector).forEach(function (link) {
         link.addEventListener('click', function (event) {
            event.preventDefault();
            scrollToTarget(options, this.getAttribute('href'));
         });
      });

      document.querySelectorAll(ctaSelector).forEach(function (button) {
         button.addEventListener('click', function (event) {
            var handled = scrollToTarget(options, this.getAttribute('href'));
            if (handled) event.preventDefault();
         });
      });
   }

   window.StickMindLegacyNavigation = {
      setup: setup
   };
})();
