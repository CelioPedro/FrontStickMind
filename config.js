(function () {
   'use strict';

   window.StickMindLegacy = {
      assets: {
         headModel: 'assets/models/head.obj'
      },

      particles: {
         desktopSubdivisions: 18,
         mobileSubdivisions: 52,
         modelScale: 9
      },

      camera: {
         initialState: { x: 0, y: 0, z: 350, headOffY: 0.4, headOffX: -0.2 },
         sections: [
            { camX: 0, camY: 0, camZ: 350, headRotOffsetY: 0, headRotOffsetX: 0, bloom: 2.0 },
            { camX: 0, camY: 0, camZ: 60, headRotOffsetY: 0, headRotOffsetX: 0, bloom: 3.5 },
            { camX: 50, camY: 10, camZ: 370, headRotOffsetY: -0.25, headRotOffsetX: 0, bloom: 1.8 },
            { camX: 0, camY: 30, camZ: 320, headRotOffsetY: 0, headRotOffsetX: -0.05, bloom: 2.2 },
            { camX: 150, camY: -5, camZ: 390, headRotOffsetY: -0.2, headRotOffsetX: 0.03, bloom: 1.5 }
         ]
      },

      uniforms: {
         size: 2.2,
         mouseRadius: 40.0,
         mouseForce: 1.8,
         breathing: 0.008
      }
   };
})();
