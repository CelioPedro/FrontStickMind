# Stick Mind legacy experience

This directory is the visual parity baseline for the Angular migration.

Do not treat these files as disposable static assets. The Angular landing route renders `index.html` through a full-screen iframe so the original Three.js, GSAP, scroll choreography, typography, and section timing remain intact while the system is modularized.

## Active files

- `index.html`: legacy DOM and CDN dependency order.
- `config.js`: editable runtime contract for camera states, particle density, uniforms, and asset paths.
- `shaders.js`: particle vertex and fragment shader source used by the legacy engine.
- `scene.js`: Three.js scene, camera, renderer, composer, material, and cursor light setup.
- `surface-sampler.js`: high-density surface sampling used to generate particle buffers from the head model.
- `model-loader.js`: OBJ loading, centroid calculation, particle geometry assembly, and head point positioning.
- `navigation.js`: header/nav/CTA click handling and smooth section scrolling.
- `section-state.js`: shared helpers for section index parsing and active nav state.
- `home-transition.js`: Home wheel zoom, Home-to-Us transition, and Us-to-Home reverse transition.
- `style.css`: complete visual system for the legacy page.
- `script.js`: Three.js particle head, GSAP timelines, scroll state, and section choreography.
- `assets/models/head.obj`: particle surface source model.
- `assets/images/mockvideo.png`: Us section video placeholder.

## Maintenance rules

- Keep the Angular iframe shell visually invisible.
- Preserve `index.html`, `style.css`, and `script.js` behavior until a modular replacement has matching visual QA.
- Prefer changing camera, particle, asset, and uniform values through `config.js` before editing `script.js`.
- Prefer editing particle shader source in `shaders.js` before touching shader fallback strings in `script.js`.
- Prefer small, named changes tied to a specific section or animation.
- Check the first viewport and the Home-to-Us choreography after any edit touching global styles, scroll, canvas, camera state, shader uniforms, or GSAP timelines.
