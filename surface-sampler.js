(function () {
   'use strict';

   function interpolateSurface(options) {
      var THREE = options.THREE;
      var geometry = options.geometry;
      var scale = options.scale;
      var subdivisions = options.subdivisions;
      var centroid = options.centroid;

      var positions = [], normals = [], speeds = [], randoms = [];
      var posAttr = geometry.getAttribute('position');
      var normAttr = geometry.getAttribute('normal');
      var indexAttr = geometry.index;

      function getVertex(idx) {
         return new THREE.Vector3(
            posAttr.getX(idx) * scale,
            posAttr.getY(idx) * scale,
            posAttr.getZ(idx) * scale
         );
      }

      function getNormal(idx) {
         if (!normAttr) return new THREE.Vector3(0, 0, 1);
         return new THREE.Vector3(
            normAttr.getX(idx), normAttr.getY(idx), normAttr.getZ(idx)
         ).normalize();
      }

      var faceCount = indexAttr ? indexAttr.count / 3 : posAttr.count / 3;

      for (var f = 0; f < faceCount; f++) {
         var ia, ib, ic;
         if (indexAttr) {
            ia = indexAttr.getX(f * 3);
            ib = indexAttr.getX(f * 3 + 1);
            ic = indexAttr.getX(f * 3 + 2);
         } else {
            ia = f * 3; ib = f * 3 + 1; ic = f * 3 + 2;
         }

         var vA = getVertex(ia), vB = getVertex(ib), vC = getVertex(ic);
         var nA = getNormal(ia), nB = getNormal(ib), nC = getNormal(ic);

         var fcx = (vA.x + vB.x + vC.x) / 3;
         var fcy = (vA.y + vB.y + vC.y) / 3;
         var fcz = (vA.z + vB.z + vC.z) / 3;

         var anx = (nA.x + nB.x + nC.x) / 3;
         var any = (nA.y + nB.y + nC.y) / 3;
         var anz = (nA.z + nB.z + nC.z) / 3;
         var anl = Math.sqrt(anx * anx + any * any + anz * anz) || 1;
         anx /= anl; any /= anl; anz /= anl;

         var tcx = centroid.x - fcx, tcy = centroid.y - fcy, tcz = centroid.z - fcz;
         var tcl = Math.sqrt(tcx * tcx + tcy * tcy + tcz * tcz) || 1;
         tcx /= tcl; tcy /= tcl; tcz /= tcl;

         var dot = anx * tcx + any * tcy + anz * tcz;

         if (dot > 0.25) continue;

         var cX = Math.abs(fcx) < 20;
         var mY = fcy > -30 && fcy < 30;
         var bF = fcz < 70;
         var iN = dot > -0.1;
         if (cX && mY && bF && iN) continue;

         for (var s = 0; s < subdivisions; s++) {
            var r1 = Math.random(), r2 = Math.random();
            if (r1 + r2 > 1) { r1 = 1 - r1; r2 = 1 - r2; }
            var r3 = 1 - r1 - r2;

            var px = vA.x * r1 + vB.x * r2 + vC.x * r3;
            var py = vA.y * r1 + vB.y * r2 + vC.y * r3;
            var pz = vA.z * r1 + vB.z * r2 + vC.z * r3;

            var nx = nA.x * r1 + nB.x * r2 + nC.x * r3;
            var ny = nA.y * r1 + nB.y * r2 + nC.y * r3;
            var nz = nA.z * r1 + nB.z * r2 + nC.z * r3;
            var nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;

            positions.push(px, py, pz);
            normals.push(nx / nl, ny / nl, nz / nl);
            speeds.push(0.5 + Math.random() * 0.5);
            randoms.push(Math.random());
         }
      }

      return { positions: positions, normals: normals, speeds: speeds, randoms: randoms };
   }

   window.StickMindLegacySurfaceSampler = {
      interpolateSurface: interpolateSurface
   };
})();
