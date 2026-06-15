(function () {
   'use strict';

   function parseSectionIndex(value) {
      var index = parseInt(value, 10);
      return Number.isNaN(index) ? -1 : index;
   }

   function setActiveNav(index) {
      document.querySelectorAll('.nav-link').forEach(function (link) {
         link.classList.toggle('active', parseSectionIndex(link.dataset.section) === index);
      });
   }

   window.StickMindLegacySectionState = {
      parseSectionIndex: parseSectionIndex,
      setActiveNav: setActiveNav
   };
})();
