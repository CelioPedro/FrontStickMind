# Particles Architecture Plan

This document defines the target architecture for evolving the current high-end landing experience into a professional product codebase, while preserving the custom 3D and animation language that makes the project distinctive.

## Current State

The project is currently a static frontend:

- `teste head/index.html`: DOM structure, external library imports, and page sections.
- `teste head/style.css`: visual system, layout, responsive rules, chat UI, contact timeline, cursor, and section styling.
- `teste head/script.js`: complete experience engine, including Three.js setup, shaders, particle generation, GSAP timelines, scroll interception, section state, cursor lighting, and gaze tracking.
- `mockvideo.png`: placeholder media asset.

The current implementation is compact and expressive, but most responsibilities live in one JavaScript file. Future work should preserve the creative control while separating responsibilities into explicit modules.

## Product Direction

The project should be prepared for two layers:

1. Public experience site
   - High-end branded landing page.
   - 3D particle head and choreographed scroll experience.
   - SEO-friendly content.
   - Fast loading, resilient asset strategy, strong mobile behavior.

2. Future educational platform
   - Authentication.
   - Courses, modules, lessons, and progress.
   - User dashboard.
   - Admin/content management.
   - Payments/subscriptions if needed.
   - Analytics and learning insights.

## Recommended Stack

### Frontend

Use Angular 22 with TypeScript when the migration begins.

Reasons:

- Strong structure for a future platform.
- Good fit for dashboards, authenticated areas, forms, admin tools, and long-lived product code.
- SSR/hybrid rendering support for public routes.
- Clear separation between route/page/component/service layers.

Angular should organize the application, not drive the animation frame loop. The visual engine should remain framework-agnostic enough to be tested and reused.

### Experience Engine

Use Three.js and GSAP as first-class dependencies.

- `three`: rendering, OBJ/GLTF loading, camera, shaders, post-processing.
- `gsap`: timelines, tweens, controlled transitions.
- `ScrollTrigger`: scroll-linked section activation.
- Optional later: `lenis` for smooth scroll, only if it does not fight the existing wheel-interceptor choreography.

The current engine should be extracted into a dedicated TypeScript module instead of being rewritten from scratch.

### Backend

Do not create the backend before the educational product requirements are concrete.

When needed, use:

- Java 21+
- Spring Boot 4
- Spring Security
- PostgreSQL
- Flyway or Liquibase
- OAuth2/OIDC via external provider or Spring Authorization Server, depending on product needs.

The backend should expose APIs for platform features. It should not be involved in rendering the 3D experience.

## Target Repository Structure

The long-term structure should look like this:

```txt
particles/
  apps/
    site/
      src/
        app/
          pages/
          shared/
          shell/
        experience/
          components/
          services/
        assets/
      public/
        models/
        images/
        videos/
    api/
      src/main/java/
      src/main/resources/
  libs/
    experience-engine/
      scene/
      particles/
      shaders/
      scroll/
      choreography/
      gaze/
      assets/
    design-system/
    content/
  docs/
    architecture.md
    animation-system.md
    implementation-roadmap.md
```

For the first migration, it is acceptable to start with only `apps/site` and `libs/experience-engine`.

## Frontend Boundaries

Angular responsibilities:

- Routing.
- Page composition.
- Static and dynamic content rendering.
- SEO metadata.
- Layout shell.
- Platform UI.
- Forms and API integration.
- User/session state.

Experience engine responsibilities:

- WebGL renderer lifecycle.
- Three.js scene/camera/composer.
- Particle head creation.
- Shader uniforms.
- Render loop.
- Camera state interpolation.
- Section choreography.
- GSAP timelines.
- Scroll interception.
- DOM target tracking for gaze behavior.

CSS/design-system responsibilities:

- Tokens.
- Typography.
- Layout primitives.
- Header/footer styling.
- Buttons, cards, chat bubbles, timeline, content sections.
- Responsive rules.

## Migration Principle

Do not rewrite the creative engine blindly.

The current implementation already encodes important visual taste and timing. The first professionalization pass should move behavior into named modules while preserving output:

- Same sections.
- Same camera states.
- Same shader look.
- Same zoom dive behavior.
- Same chat reveal behavior.
- Same contact timeline behavior.

Only after parity is verified should the engine be improved.

## Asset Strategy

Current risk: the head model is loaded from an external S3 URL. This should be localized.

Target:

```txt
apps/site/public/models/head.obj
apps/site/public/images/mockvideo.png
```

Later, prefer GLB/GLTF over OBJ if the model pipeline becomes more complex.

## SSR And Browser-Only Code

The public site can use SSR/SSG for SEO, but Three.js must only initialize in the browser.

Rules:

- Never access `window`, `document`, `WebGLRenderer`, or DOM geometry during server render.
- Initialize the experience after the browser view exists.
- Destroy renderer, listeners, ScrollTriggers, and GSAP timelines when the page/component is destroyed.
- Keep a static fallback layout visible before the WebGL engine hydrates.

## Future Platform Modules

When the educational platform starts, add backend and frontend modules in this order:

1. Authentication and user profile.
2. Course catalog.
3. Lesson player.
4. Progress tracking.
5. Admin content management.
6. Payments/subscriptions.
7. Analytics and recommendation systems.

The landing experience should stay independent from the logged-in product shell.
