# Legacy parity baseline

The current Angular application intentionally renders the original Stick Mind experience through a full-screen iframe.
This preserves visual parity while the codebase is migrated into maintainable Angular and TypeScript modules.

## Current entrypoints

- Angular shell: `apps/site/src/app/pages/landing/landing.page.*`
- Legacy runtime: `apps/site/public/legacy/index.html`
- Legacy runtime config: `apps/site/public/legacy/config.js`
- Legacy shader source: `apps/site/public/legacy/shaders.js`
- Legacy scene setup: `apps/site/public/legacy/scene.js`
- Legacy surface sampler: `apps/site/public/legacy/surface-sampler.js`
- Legacy model loader: `apps/site/public/legacy/model-loader.js`
- Legacy navigation: `apps/site/public/legacy/navigation.js`
- Legacy section state: `apps/site/public/legacy/section-state.js`
- Legacy Home transition: `apps/site/public/legacy/home-transition.js`
- Legacy section activation: `apps/site/public/legacy/section-activation.js`
- Legacy About section choreography: `apps/site/public/legacy/sections/about-section.js`
- Legacy Services section choreography: `apps/site/public/legacy/sections/services-section.js`
- Legacy Contact section choreography: `apps/site/public/legacy/sections/contact-section.js`
- Legacy entrance animation: `apps/site/public/legacy/entrance-animation.js`
- Legacy render loop: `apps/site/public/legacy/render-loop.js`
- Legacy styles: `apps/site/public/legacy/style.css`
- Legacy engine: `apps/site/public/legacy/script.js`
- Legacy model: `apps/site/public/legacy/assets/models/head.obj`
- Legacy Us mock image: `apps/site/public/legacy/assets/images/mockvideo.png`

The Angular shell should stay visually invisible: no margins, borders, cards, overlays, wrappers, or scroll behavior should be introduced outside the iframe.

## Why keep the iframe for now

- It protects the original choreography while we reorganize the system.
- It gives us a stable visual reference for screenshots and interaction QA.
- It avoids partially reimplementing the Three.js and GSAP behavior before the animation boundaries are understood.

This is not the final architecture. It is a parity bridge.

## Legacy engine map

`script.js` is a single IIFE that owns the whole experience:

- Shader strings and particle uniforms.
- Three.js scene, camera, renderer, composer, bloom pass, lights, raycaster, and cursor light.
- OBJ loading and surface particle generation.
- Section camera states for Home, Us, About, Services, and Contact.
- Custom cursor animation.
- Home wheel interception and zoom-dive transition into Us.
- Reverse transition from Us back to Home.
- GSAP ScrollTrigger section snapping and active nav state.
- About content reveal and counters.
- Services wheel-driven chat reveal and typewriter automation.
- Contact journey timeline and CTA reveal.
- Resize, mousemove, raycast interaction, and render loop.

`config.js` is the first extracted runtime contract. It currently owns:

- Asset paths used by the engine.
- Particle density and model scale.
- Initial camera state.
- Per-section camera and bloom states.
- Particle shader uniform defaults.

`shaders.js` owns the particle vertex and fragment shader source.
`script.js` requires `window.StickMindLegacyShaders` to be available before initialization.

`scene.js` owns the Three.js scene, camera, renderer, composer, bloom pass, particle material, and cursor light setup.

`surface-sampler.js` owns the high-density interpolation that turns model triangles into particle buffer arrays.

`model-loader.js` owns OBJ loading, centroid calculation, particle geometry assembly, and head point positioning.

`navigation.js` owns header, nav, and CTA click handling for smooth section scrolling.

`section-state.js` owns section index parsing and active nav state helpers.

`home-transition.js` owns the Home wheel zoom, Home-to-Us transition, and Us-to-Home reverse transition.

`section-activation.js` owns section entry orchestration, camera/bloom/header state, and section choreography routing.

`sections/about-section.js` owns the About counters and head eye-tracking choreography.

`sections/services-section.js` owns the Services chat queue, wheel interception, typewriter, and badge reveal.

`sections/contact-section.js` owns the Contact timeline, milestone typewriter, line growth, and CTA reveal.

`entrance-animation.js` owns loading dismissal, the Home hero typewriter, header reveal, and mouse unlock.

`render-loop.js` owns mouse tracking, resize handling, camera/head follow, cursor light motion, and composer rendering.

`style.css` is organized mostly by visual sections:

- Root tokens and reset.
- Loading screen.
- Canvas and cursor.
- Header and light-mode header state.
- Shared section typography and CTA styles.
- Home hero entrance states.
- Us video section.
- About stats.
- Services chat UI.
- Contact journey, timeline, CTA, and footer.
- Responsive rules.

## Known maintainability debt

- `script.js` still mixes lifecycle, scene/model bootstrap, and ScrollTrigger registration, although camera, particle, asset, uniform values, preferred shader source, scene setup, surface sampling, model geometry assembly, click navigation, active nav helpers, the Home/Us transition, section activation, entrance animation, render loop, About choreography, Services choreography, and Contact choreography now live outside the main engine file.
- `style.css` combines tokens, layout, component rules, section rules, and responsive overrides.
- CDN scripts are still loaded directly by the legacy HTML.
- Angular currently hosts the experience but does not control the DOM, animations, metadata, or future platform routes inside the iframe.
- The experimental Angular engine modules under `apps/site/src/app/experience/engine/` are not wired to the visible page after the parity pivot.

## Migration sequence

1. Keep `/legacy` as the golden visual baseline.
2. Add visual QA checkpoints for the first viewport, Home-to-Us transition, About counters, Services chat, and Contact timeline.
3. Move third-party dependencies from CDN tags toward package-managed imports, without changing output.
4. Split `script.js` by responsibility while preserving the legacy HTML entrypoint:
   - `shaders`
   - `scene`
   - `particles`
   - `section-states`
   - `navigation`
   - `home-transition`
   - `section-animations`
   - `chat-sequence`
   - `contact-timeline`
   - `render-loop`
5. Split `style.css` into stable layers:
   - `tokens`
   - `base`
   - `layout`
   - `header`
   - `sections`
   - `components`
   - `responsive`
6. Replace the iframe with Angular-hosted markup only after the modular legacy runtime has visual parity.
7. Move the 3D runtime into Angular lifecycle hooks once the engine boundary is stable.

## Change rule

Any change to choreography must name the affected section and be checked against the legacy baseline before it is considered done.
