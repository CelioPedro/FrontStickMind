# Legacy modularization plan

This plan defines how to split `apps/site/public/legacy/script.js` without losing visual parity.

The goal is not to rewrite the experience all at once.
The goal is to create stable boundaries around the existing behavior so each animation can be maintained, tuned, tested, and eventually moved into the Angular platform.

## Current state

- `config.js` owns the first extracted constants: asset paths, particle density, camera states, and shader uniform defaults.
- `shaders.js` owns the preferred particle vertex and fragment shader source.
- `scene.js` owns Three.js scene setup, renderer, composer, particle material creation, and cursor light creation.
- `surface-sampler.js` owns the high-density interpolation used to turn model triangles into particle buffers.
- `model-loader.js` owns OBJ loading, centroid calculation, particle geometry assembly, and head point positioning.
- `navigation.js` owns header/nav/CTA click handling and smooth section scrolling.
- `section-state.js` owns shared section index parsing and active nav state helpers.
- `script.js` still owns lifecycle, loading UI, input, scroll interception, section activation choreography, and section-specific animation.
- Angular currently hosts the original experience through a full-screen iframe.

## Extraction order

### 1 - Runtime config

Already started with `config.js`.

Next candidates:

- Scroll thresholds, especially Home zoom distance.
- Animation durations and easing names.
- Section ids and nav labels.
- Responsive breakpoints used by the runtime.

Acceptance:

- Values can be changed in one place.
- No behavior changes unless explicitly intended.

### 2 - Shader source

Started with `shaders.js`.
The main engine now prefers `window.StickMindLegacyShaders` and keeps inline shader strings as a temporary fallback.

Candidate files:

- `shaders.js` - active
- later: `shaders/particle-head.vertex.glsl`
- later: `shaders/particle-head.fragment.glsl`

Acceptance:

- Particle appearance remains identical.
- Shader uniforms still match the material setup.

### 3 - Scene setup

Started with `scene.js`.
The main engine now calls the scene module and keeps ownership of runtime variables used by later animation code.

Extracted:

- scene
- camera
- renderer
- composer
- bloom pass
- shader material creation
- cursor light

Candidate file:

- `scene.js` - active

Acceptance:

- Canvas is created once.
- Resize still updates renderer, composer, and camera.
- Fallback without composer still works.

### 4 - Particle model pipeline

Started with `surface-sampler.js` and `model-loader.js`.

Extract:

- OBJ loading - active in `model-loader.js`
- centroid computation - active in `model-loader.js`
- surface interpolation - active in `surface-sampler.js`
- buffer geometry creation - active in `model-loader.js`
- loading progress state

Candidate files:

- `model-loader.js` - active
- `surface-sampler.js` - active

Acceptance:

- Particle count stays within expected range.
- Head position and scale match the baseline.
- Loading screen still reaches `Ready`.

### 5 - Section choreography

Navigation and section-state extraction has started with `navigation.js` and `section-state.js`.

Extract one section at a time:

- Navigation click routing and smooth scroll - active in `navigation.js`.
- Active nav state helpers - active in `section-state.js`.
- Home entrance and zoom-dive transition.
- Us reverse transition.
- About counters and head pose automation.
- Services chat queue and typewriter.
- Contact timeline.

Candidate folder:

- `sections/`

Acceptance:

- Each section can be tested against the QA checklist.
- Scroll locking and nav state remain stable.

### 6 - Runtime controller

After the above, reduce `script.js` into a coordinator:

- load dependencies
- create context
- start scene
- register events
- start render loop

Acceptance:

- The top-level file explains the application flow in under 150 lines.

## Rules

- Extract before rewriting.
- Preserve global dependency order until package-managed imports are introduced.
- Do not move a section animation and a shader change in the same commit.
- After each extraction, validate first viewport and the affected choreography.
- Keep commits small and named by boundary.

## Future Angular migration

Only after the legacy modules are stable:

1. Move runtime modules from `public/legacy` into Angular source.
2. Replace CDN dependencies with package imports.
3. Replace iframe with Angular-hosted DOM.
4. Attach the Three.js runtime to Angular lifecycle hooks.
5. Keep `/legacy` available as a reference until the new route has visual parity.
