# Stick Mind - Documentation & Developer Guide

> **Nota sobre o Idioma:** Este projeto é desenvolvido 100% em inglês com o propósito de praticar o idioma. Para desafiar não apenas a escrita e a leitura, o vídeo de apresentação também será gravado em inglês, expandindo o treino para a pronúncia e a fluência verbal.

> Transformative Psychology for Growth. A highly interactive, 3D particle-driven landing page combining Three.js, custom shaders, and GSAP scroll animations.

---

## Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Tech Stack](#tech-stack)
4. [Architecture & Engine](#architecture--engine)
   - [Three.js Pipeline](#threejs-pipeline)
   - [Custom Shaders (Particle System)](#custom-shaders-particle-system)
   - [GSAP & Scroll Management](#gsap--scroll-management)
5. [Detailed Section Behaviors](#detailed-section-behaviors)
   - [Home & Zoom Transition](#1-home--zoom-transition)
   - [Us (Light Section)](#2-us-light-section)
   - [About (Counters)](#3-about-counters)
   - [Services (Chat Interface)](#4-services-chat-interface)
   - [Contact (Timeline)](#5-contact-timeline)
6. [Adding or Modifying Features](#adding-or-modifying-features)
   - [How to Add a New Section](#how-to-add-a-new-section)
   - [Modifying Particle Aesthetics](#modifying-particle-aesthetics)
7. [Future Implementation Docs](#future-implementation-docs)

---

## Overview

Stick Mind is an immersive, single-page experience built around a 3D particle head. As the user scrolls, the camera moves around the head, the lighting changes (bloom), and the head rotates to "look" at UI elements (eye-tracking). 

The project avoids standard scrolling on the initial view, replacing it with a custom zoom-dive transition into the "Us" section, after which standard CSS scroll-snapping and GSAP ScrollTriggers take over.

---

## Future Implementation Docs

The current static experience is documented in this README. The professionalization and platform roadmap live in:

- [Architecture Plan](docs/architecture.md)
- [Animation And 3D System](docs/animation-system.md)
- [Implementation Roadmap](docs/implementation-roadmap.md)
- [Legacy Parity Baseline](docs/legacy-parity-baseline.md)
- [Static Experience QA Checklist](docs/static-qa-checklist.md)

These documents define the target Angular/TypeScript frontend structure, future Spring Boot backend direction, experience-engine boundaries, and phased migration plan.

---

## Project Structure

Current migration structure:

- `apps/site/`: Angular shell and future frontend platform.
- `apps/site/src/app/pages/landing/`: full-screen legacy bridge route.
- `apps/site/src/app/experience/`: experience configuration and engine experiments.
- `apps/site/public/legacy/`: golden visual baseline rendered by Angular.
- `teste head/`: original static source/reference copy.
- `docs/`: architecture, animation, migration, and QA documentation.

```
particles/
├── teste head/
│   ├── index.html     # Main DOM structure, UI overlays, and library imports
│   ├── style.css      # CSS Variables, Glassmorphism UI, Responsive rules
│   ├── script.js      # Core Engine: Three.js, Shaders, GSAP Logic, State Machine
│   └── mockvideo.png  # Asset placeholder
├── mockassets/        # Other assets
└── README.md          # This documentation
```

---

## Tech Stack

| Layer             | Technology     | Description |
|-------------------|----------------|-------------|
| **Core**          | Vanilla JS/HTML/CSS | No build steps required (React/Vue/Vite are NOT used). |
| **3D Rendering**  | Three.js (r128) | Core WebGL rendering, scene graph, and camera math. |
| **3D Loading**    | OBJLoader      | Loads the `head.obj` 3D model. |
| **Post-Processing**| EffectComposer, UnrealBloomPass | Adds the neon glow to the particles. |
| **Animation**     | GSAP (3.12.2)  | Tweening engine for camera movement, UI reveals, and state changes. |
| **Scroll Control**| ScrollTrigger, ScrollToPlugin | Triggers animations based on scroll position and smooth scrolling. |

---

## Architecture & Engine

The entire logic is housed inside an IIFE (Immediately Invoked Function Expression) in `script.js` to avoid polluting the global scope. 

### Three.js Pipeline

1. **Scene Initialization**: A standard Three.js scene is created with a `PerspectiveCamera` and a `WebGLRenderer`.
2. **Post-Processing**: An `EffectComposer` is layered on top with an `UnrealBloomPass`. The bloom strength is dynamically controlled per section via GSAP.
3. **Model Loading & Particle Generation**: 
   - `OBJLoader` fetches the head model.
   - The `interpolateSurface()` function analyzes the geometry. It filters out internal/unwanted faces and generates high-density particles across the surface by interpolating between the vertices of each face.
   - A `THREE.Points` object is created using a custom `ShaderMaterial`.
4. **Lighting**: A `PointLight` (Cursor Light / "The Spark") is bound to the mouse coordinates to illuminate particles dynamically as the user moves the cursor.

### Custom Shaders (Particle System)

The visual identity relies heavily on GLSL shaders.

**Vertex Shader (`vertexShader`)**:
- **Breathing**: Uses a sine wave based on `uTime` to gently scale the head and move it on the Y-axis.
- **Mouse Repulsion**: Calculates the distance from each particle to `uMouse`. If within `uMouseRadius`, it pushes the particle away along its normal vector.
- **Backface Culling & Depth**: Fades out particles that are facing away from the camera or are too far in the Z-axis, creating a cleaner, "corporate" silhouette rather than a chaotic point cloud.

**Fragment Shader (`fragmentShader`)**:
- **Shape**: Discards pixels outside a radius to make circular particles with a "matte core + soft glow".
- **Color Gradient**: Interpolates between Deep Purple (`0.12, 0.06, 0.22`) and Lavender Neon (`0.65, 0.52, 0.85`) based on depth and the simulated directional lighting (`vLighting`).

### GSAP & Scroll Management

The experience is state-driven. We define a config array for the sections:

```javascript
var sectionStates = [
   { camX: 0, camY: 0, camZ: 350, headRotOffsetY: 0, headRotOffsetX: 0, bloom: 2.0 }, // Home
   { camX: 0, camY: 0, camZ: 60, headRotOffsetY: 0, headRotOffsetX: 0, bloom: 3.5 },  // Us
   // ... About, Services, Contact
];
```

A `currentCamState` object holds the *current* tweened values. In the `animate()` render loop, the Three.js camera and `headPoints.rotation` constantly interpolate (using `+= (target - current) * 0.03`) toward `currentCamState` for buttery smooth lag.

---

## Detailed Section Behaviors

### 1. Home & Zoom Transition
- **Behavior**: Native scrolling is blocked (`e.preventDefault()` on wheel events).
- **Action**: Scrolling accumulates a `zoomProgress` (0 to 1). The camera Z-index moves closer to the head, and bloom intensifies.
- **Transition**: At 100% zoom, `triggerUsTransition()` runs. It fades the particles, brings up a white overlay, switches the header to `.light-mode`, jumps the native scroll position to the "Us" section, and fades the overlay out.

### 2. Us (Light Section)
- **Behavior**: The only section with a light background (`#f5f3f0`). 
- **Action**: The 3D particles are hidden (size set to 0). The header text inverts to dark.
- **Reverse**: If the user is at the top of this section and scrolls UP, `reverseUsTransition()` triggers, taking them back to the Home zoom state.

### 3. About (Counters)
- **Behavior**: Standard CSS scroll-snap applies here. As the section enters via GSAP `ScrollTrigger`, the camera moves to `sectionStates[2]`.
- **Eye-Tracking**: As each statistic counter (e.g., "98%") fades in, `trackHeadTo()` temporarily overrides the camera state to make the 3D head rotate and "look" directly at the DOM element. Once the count finishes, the head returns to its default resting angle for that section.

### 4. Services (Chat Interface)
- **Behavior**: Wheel scrolling is intercepted *again*.
- **Action**: Instead of scrolling down the page, scrolling down reveals chat bubbles sequentially (`revealNextMessage()`). 
- **Eye-Tracking & Typewriter**: The 3D head tracks each message as it pops up. A custom typewriter effect runs on a secondary DOM layer (`.msg-typed-overlay`) over a hidden text sizer (`.msg-sizer`) to prevent layout shifts.
- **Release**: Once all messages are revealed, the wheel interceptor is removed, and the user can scroll to Contact.

### 5. Contact (Timeline)
- **Behavior**: Sequential timeline reveal triggered by `ScrollTrigger`.
- **Action**: Each milestone fades in, the text typewrites, and the vertical connection line grows. The 3D head tracks the active milestone. Finally, the "Request Access" button appears, and the head looks at it.

---

## Adding or Modifying Features

### How to Add a New Section

1. **HTML**: Add a new `<section id="new-section" class="section">` inside `<main id="scroll-container">`.
2. **Nav**: Add a link in `<nav id="main-nav">` with `data-section="5"`.
3. **State config**: In `script.js`, update `sectionStates` with a new object representing the camera and bloom settings for index 5.
4. **ScrollTrigger**: The existing loop in `setupScrollAnimations()` automatically creates a ScrollTrigger for `.section` elements. However, ensure any custom logic (like `idx === 5`) is added to the `activateSection(idx)` function.

### Modifying Particle Aesthetics

- **Color**: Edit the `deepPurple`, `lavenderNeon`, and `hotGlow` vec3 values inside the `fragmentShader` string.
- **Density**: In `loadHeadModel()`, modify `var subs = isMobile ? 52 : 18;` (Higher number = MORE particles. Note: mobile uses *more* subdivisions because the device pixel ratio scaling is often different, or you can lower it for performance).
- **Breathing / Mouse Force**: Edit the `uniforms` object at the top of `script.js`. `uBreathing` controls the idle pulse, and `uMouseForce` controls how aggressively particles fly away from the cursor.

---

*Documentation compiled by pccontra*
