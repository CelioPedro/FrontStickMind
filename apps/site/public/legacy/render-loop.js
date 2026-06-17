(function () {
   'use strict';

   function create(options) {
      var THREE = options.THREE;
      var scene = options.scene;
      var camera = options.camera;
      var renderer = options.renderer;
      var composer = options.composer;
      var currentCamState = options.currentCamState;

      var width = options.width;
      var height = options.height;
      var mouseEnabled = false;
      var mouse3D = new THREE.Vector3(0, 0, 0);
      var raycaster = new THREE.Raycaster();
      var mouseNorm = new THREE.Vector2(0, 0);
      var mouseX = 0;
      var mouseY = 0;
      var targetRotY = 0;
      var targetRotX = 0;
      var clock = new THREE.Clock();

      function setupEvents() {
         document.addEventListener('mousemove', onMouseMove);
         window.addEventListener('resize', onResize);
      }

      function onMouseMove(event) {
         var halfW = width / 2;
         var halfH = height / 2;
         mouseX = (event.clientX - halfW) / 2;
         mouseY = (event.clientY - halfH) / 2;

         mouseNorm.x = (event.clientX / width) * 2 - 1;
         mouseNorm.y = -(event.clientY / height) * 2 + 1;

         raycaster.setFromCamera(mouseNorm, camera);
         var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
         raycaster.ray.intersectPlane(plane, mouse3D);
      }

      function onResize() {
         width = window.innerWidth;
         height = window.innerHeight;
         if (options.onResize) options.onResize(width, height);

         camera.aspect = width / height;
         camera.updateProjectionMatrix();
         renderer.setSize(width, height);
         if (composer) composer.setSize(width, height);
      }

      function setMouseEnabled(enabled) {
         mouseEnabled = !!enabled;
      }

      function start() {
         requestAnimationFrame(tick);
      }

      function tick() {
         requestAnimationFrame(tick);
         var time = clock.getElapsedTime();

         var particleMaterial = options.getParticleMaterial ? options.getParticleMaterial() : null;
         if (particleMaterial) {
            particleMaterial.uniforms.uTime.value = time;
            particleMaterial.uniforms.uMouse.value.copy(mouse3D);
         }

         camera.position.x += (currentCamState.x + (mouseEnabled ? mouseX * 0.05 : 0) - camera.position.x) * 0.03;
         camera.position.y += (currentCamState.y + (mouseEnabled ? -mouseY * 0.05 : 0) - camera.position.y) * 0.03;
         camera.position.z += (currentCamState.z - camera.position.z) * 0.03;

         var halfW = width / 2;
         var halfH = height / 2;
         targetRotY = (mouseEnabled ? (mouseX / halfW) * 0.7 : 0) + currentCamState.headOffY;
         targetRotX = (mouseEnabled ? (mouseY / halfH) * 0.45 : 0) + currentCamState.headOffX;

         var headPoints = options.getHeadPoints ? options.getHeadPoints() : null;
         if (headPoints) {
            headPoints.rotation.y += (targetRotY - headPoints.rotation.y) * 0.03;
            headPoints.rotation.x += (targetRotX - headPoints.rotation.x) * 0.03;
         }

         var cursorLight = options.getCursorLight ? options.getCursorLight() : null;
         if (cursorLight) {
            cursorLight.position.x += (mouse3D.x - cursorLight.position.x) * 0.08;
            cursorLight.position.y += (mouse3D.y - cursorLight.position.y) * 0.08;
            cursorLight.position.z = 60;
         }

         camera.lookAt(scene.position);

         if (composer) {
            composer.render();
         } else {
            renderer.render(scene, camera);
         }
      }

      return {
         setupEvents: setupEvents,
         setMouseEnabled: setMouseEnabled,
         start: start
      };
   }

   window.StickMindLegacyRenderLoop = {
      create: create
   };
})();
