# Animation And 3D System

This document explains the current experience engine and the target modular shape for future implementation.

## Current Engine Summary

The current engine lives in `teste head/script.js`.

It combines:

- Three.js scene, camera, renderer, and post-processing.
- Custom GLSL shaders for particle rendering.
- OBJ model loading.
- Surface interpolation to convert a head mesh into a particle cloud.
- Mouse-driven particle repulsion and cursor lighting.
- GSAP timelines for entrance, section transitions, counters, chat, and contact timeline.
- ScrollTrigger for section activation.
- Wheel interceptors for the home zoom dive and services chat progression.

## Core Visual Concepts

### Particle Head

The head is not rendered as a mesh. The OBJ geometry is sampled into many surface particles. Each particle stores:

- Position.
- Normal.
- Random value.
- Speed value.

The particles are rendered with `THREE.Points` and a custom `ShaderMaterial`.

### Vertex Shader

The vertex shader controls:

- Breathing motion.
- Mouse repulsion.
- Normal-based fading.
- Depth-based visibility.
- Per-particle size attenuation.
- Lighting factor passed to the fragment shader.

### Fragment Shader

The fragment shader controls:

- Circular particle shape.
- Matte core plus soft glow.
- Deep purple to lavender gradient.
- Depth and alpha falloff.

### Cursor Light

A `PointLight` follows the mouse intersection with a virtual plane. This creates the "spark" feeling around the particles.

## State Model

The most important pattern is section-driven state.

Each section has a camera and head rotation target:

```js
{
  camX: 0,
  camY: 0,
  camZ: 350,
  headRotOffsetY: 0,
  headRotOffsetX: 0,
  bloom: 2.0
}
```

The render loop does not jump directly to these values. It eases toward them every frame. This is what gives the experience its soft, expensive feel.

## Current Sections

### Home

The first section blocks native scrolling. Wheel movement becomes zoom progress.

Behavior:

- Accumulates wheel delta.
- Moves camera closer to the head.
- Intensifies bloom.
- Fades hero content.
- At full progress, triggers transition to the light section.

### Us

The light section is revealed behind a white overlay.

Behavior:

- Particles shrink to zero.
- Header switches to light mode.
- Scroll position jumps behind the overlay.
- Us content fades in.
- Mandatory snap is enabled after the transition.

### About

The section activates counters.

Behavior:

- Content fades in.
- Stats appear sequentially.
- Each number counts up.
- Head rotates toward each statistic.
- Head returns to section resting pose.

### Services

The section becomes a scroll-driven chat reveal.

Behavior:

- Wheel is intercepted while chat messages remain hidden.
- One message is revealed per downward scroll.
- Text uses a two-layer typewriter pattern:
  - Invisible full text locks layout size.
  - Absolute overlay types visible characters.
- Head tracks the active message.
- After all messages are revealed, normal scroll resumes.

### Contact

The section reveals a journey timeline.

Behavior:

- Left header fades in.
- Milestones reveal one by one.
- Descriptions type out.
- Head tracks active milestone.
- CTA appears at the end and receives head focus.

Known implementation note: the JavaScript currently looks for `.ct-line`, while the CSS defines `.ct-stem` and the HTML does not include `.ct-line`. This should be reconciled during the first cleanup pass.

## Target Engine Modules

The current `script.js` should become these modules during migration:

```txt
experience-engine/
  ExperienceEngine.ts
  scene/
    SceneController.ts
    RendererController.ts
    CameraController.ts
    PostProcessingController.ts
  particles/
    ParticleHead.ts
    SurfaceSampler.ts
    ParticleUniforms.ts
  shaders/
    particleVertex.glsl
    particleFragment.glsl
  scroll/
    ScrollCoordinator.ts
    WheelInterceptor.ts
    SectionRegistry.ts
  choreography/
    EntranceTimeline.ts
    HomeZoomTransition.ts
    AboutCountersTimeline.ts
    ServicesChatTimeline.ts
    ContactTimeline.ts
  gaze/
    GazeController.ts
    DomTargetTracker.ts
  input/
    MouseTracker.ts
    CursorLight.ts
```

## Implementation Rules

Preserve these patterns:

- Section states are the source of truth for camera and bloom targets.
- Camera and head rotation should ease in the render loop.
- GSAP should tween target state, not directly fight the render loop.
- DOM-driven gaze should calculate element center relative to viewport center.
- Text typewriter effects should avoid layout shift.
- Wheel interception should be scoped and removable.
- Mobile should reduce interaction complexity where needed.

Avoid:

- Letting Angular change animation state every frame.
- Recreating renderer or ScrollTriggers on every route update.
- Mixing unrelated section logic inside one large activation function after migration.
- Loading critical models from third-party URLs.
- Adding new scroll libraries before proving they work with the current custom wheel choreography.

## Verification Checklist

Before accepting animation changes:

- Home entrance completes.
- Header appears after hero typewriter.
- Mouse movement affects head only after entrance release.
- Wheel zoom reaches Us transition.
- Reverse transition from Us to Home still works.
- About counters run once and head tracks each stat.
- Services chat blocks scroll until messages are revealed.
- Contact timeline completes and CTA appears.
- Mobile layout has no text overlap.
- Renderer is nonblank.
- Console has no WebGL, asset, or GSAP errors.
