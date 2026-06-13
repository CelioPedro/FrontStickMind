(function () {
   'use strict';

   function computeCentroid(options) {
      var THREE = options.THREE;
      var object = options.object;
      var scale = options.scale;
      var centroid = new THREE.Vector3();
      var vertexCount = 0;

      object.traverse(function (child) {
         if (child instanceof THREE.Mesh) {
            var positionAttr = child.geometry.getAttribute('position');
            for (var i = 0; i < positionAttr.count; i++) {
               centroid.x += positionAttr.getX(i) * scale;
               centroid.y += positionAttr.getY(i) * scale;
               centroid.z += positionAttr.getZ(i) * scale;
               vertexCount++;
            }
         }
      });

      centroid.divideScalar(vertexCount);
      return centroid;
   }

   function buildParticleGeometry(options) {
      var THREE = options.THREE;
      var object = options.object;
      var sampler = options.sampler;
      var modelScale = options.modelScale;
      var subdivisions = options.subdivisions;
      var centroid = computeCentroid({
         THREE: THREE,
         object: object,
         scale: options.centroidScale
      });

      var allPos = [], allNorm = [], allSpd = [], allRnd = [];

      object.traverse(function (child) {
         if (child instanceof THREE.Mesh) {
            var geometry = child.geometry;
            if (!geometry.getAttribute('normal')) geometry.computeVertexNormals();
            var data = sampler.interpolateSurface({
               THREE: THREE,
               geometry: geometry,
               scale: modelScale,
               subdivisions: subdivisions,
               centroid: centroid
            });

            allPos = allPos.concat(data.positions);
            allNorm = allNorm.concat(data.normals);
            allSpd = allSpd.concat(data.speeds);
            allRnd = allRnd.concat(data.randoms);
         }
      });

      var particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(allPos, 3));
      particleGeometry.setAttribute('aNormal', new THREE.Float32BufferAttribute(allNorm, 3));
      particleGeometry.setAttribute('aSpeed', new THREE.Float32BufferAttribute(allSpd, 1));
      particleGeometry.setAttribute('aRandom', new THREE.Float32BufferAttribute(allRnd, 1));

      return {
         geometry: particleGeometry,
         particleCount: allPos.length / 3
      };
   }

   function createHeadPoints(options) {
      var THREE = options.THREE;
      var result = buildParticleGeometry(options);
      var headPoints = new THREE.Points(result.geometry, options.particleMaterial);

      result.geometry.computeBoundingBox();
      var center = new THREE.Vector3();
      result.geometry.boundingBox.getCenter(center);
      headPoints.position.set(-center.x, -center.y - 15, -center.z);

      return {
         headPoints: headPoints,
         particleCount: result.particleCount
      };
   }

   function loadHeadModel(options) {
      var loader = new options.THREE.OBJLoader();
      loader.load(
         options.modelUrl,
         function (object) {
            options.onModelLoaded(object);
         },
         options.onProgress,
         options.onError
      );
   }

   window.StickMindLegacyModelLoader = {
      createHeadPoints: createHeadPoints,
      loadHeadModel: loadHeadModel
   };
})();
