# Legacy parity baseline

The current Angular application intentionally renders the original Stick Mind experience through a full-screen iframe.
This preserves visual parity while the codebase is migrated into maintainable Angular and TypeScript modules.

## Current entrypoints

- Angular shell: `apps/site/src/app/pages/landing/landing.page.*`
- Legacy runtime: `apps/site/public/legacy/index.html`
- Legacy runtime config: `apps/site/public/legacy/config.js`
- Legacy shader source: `apps/site/public/legacy/shaders.js`
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

`shaders.js` owns the preferred particle vertex and fragment shader source.
`script.js` still keeps inline shader fallback strings while the legacy runtime is being modularized.

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

- `script.js` still mixes rendering, input, navigation, and section choreography, although camera, particle, asset, uniform values, and preferred shader source now live outside the main engine file.
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
