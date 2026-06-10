# Implementation Roadmap

This roadmap defines the recommended order for professionalizing the project and preparing it for future educational platform features.

## Phase 0 - Baseline Documentation

Status: started.

Goals:

- Document current architecture.
- Document animation and 3D behavior.
- Define target stack.
- Define migration strategy.

Deliverables:

- `docs/architecture.md`
- `docs/animation-system.md`
- `docs/implementation-roadmap.md`

## Phase 1 - Stabilize Current Static Version

Status: started.

Goal: make the existing static version easier to maintain before the Angular migration.

Tasks:

- Fix documentation encoding issues where practical.
- Reconcile contact timeline implementation:
  - Either add `.ct-line` to HTML/CSS.
  - Or update JavaScript to animate `.ct-stem`.
- Localize the external `head.obj` model.
- Add a local asset folder convention.
- Remove unused or misleading comments.
- Add a lightweight manual QA checklist.
- Confirm mobile layout and text wrapping.

Recommended output:

```txt
teste head/
  assets/
    models/
    images/
    videos/
```

This phase should not change the visual direction.

## Phase 2 - Create Angular Workspace

Status: started.

Goal: introduce the professional frontend structure.

Tasks:

- Create Angular app.
- Add TypeScript strict mode.
- Add routing.
- Add SSR/hybrid rendering for public routes.
- Install first-class dependencies:
  - `three`
  - `gsap`
  - optional shader loader or raw shader import support
- Move static assets into `public/`.
- Create initial app shell.
- Recreate the current landing route.

Important:

The first Angular version should aim for visual parity with the static version, not a redesign.

Implementation note:

- The local machine currently has Node `22.12.0`.
- Angular 22 requires Node `22.22.3+`, `24.15.0+`, or `26.0.0+`.
- The initial workspace was created with Angular 21 for compatibility.
- Upgrade to Angular 22 after updating Node.

## Phase 3 - Extract Experience Engine

Goal: move the current `script.js` into a modular TypeScript engine.

Tasks:

- Create `ExperienceEngine`.
- Extract scene setup.
- Extract renderer/composer setup.
- Extract particle shaders.
- Extract OBJ/model loading.
- Extract surface interpolation.
- Extract camera state and section states.
- Extract mouse tracking and cursor light.
- Extract scroll coordinator.
- Extract each section timeline.
- Add lifecycle methods:
  - `mount()`
  - `start()`
  - `resize()`
  - `destroy()`

Target interface:

```ts
const engine = new ExperienceEngine({
  canvasContainer,
  scrollContainer,
  sections,
  assets,
});

await engine.mount();
engine.start();
```

## Phase 4 - Design System And Content Layer

Goal: separate visual primitives and content from page implementation.

Tasks:

- Define design tokens.
- Move section copy into typed content files.
- Create reusable UI components:
  - Header
  - CTA button
  - Section eyebrow
  - Chat message
  - Timeline milestone
  - Video preview
- Keep high-end custom layout where needed.
- Add SEO metadata per route.

## Phase 5 - Testing And QA

Goal: make future visual changes safer.

Tasks:

- Add Playwright.
- Add smoke tests for:
  - page loads
  - no console errors
  - canvas exists
  - hero appears
  - section navigation works
- Add visual screenshots for desktop and mobile.
- Add performance budget notes.

For this project, visual QA matters as much as unit tests.

## Phase 6 - Backend Platform Foundation

Start only when platform requirements are clear.

Goal: add the educational product backend.

Recommended stack:

- Java 21+
- Spring Boot 4
- Spring Security
- PostgreSQL
- Flyway or Liquibase
- OpenAPI documentation

Initial domains:

- User
- Profile
- Course
- Module
- Lesson
- Enrollment
- Progress

Initial API shape:

```txt
/api/auth
/api/me
/api/courses
/api/courses/{id}
/api/lessons/{id}
/api/progress
```

## Phase 7 - Educational Platform Frontend

Goal: build the logged-in product experience.

Tasks:

- Add auth flow.
- Add dashboard shell.
- Add course catalog.
- Add lesson player.
- Add progress view.
- Add profile/settings.
- Add admin area if needed.

The platform shell should be visually related to the landing page, but calmer and more operational.

## Phase 8 - Product Expansion

Possible future capabilities:

- Payments and subscriptions.
- Certificates.
- Personalized learning paths.
- Community/discussion features.
- Behavioral assessments.
- Analytics dashboards.
- AI-assisted coaching or lesson recommendations.

## Recommended Immediate Next Step

Phase 1 has started. Completed items:

- Added local asset folders under `teste head/assets/`.
- Copied the Us video mock to `assets/images/mockvideo.png`.
- Downloaded the particle head model to `assets/models/head.obj`.
- Updated the current static experience to load the local model.
- Added the missing `.ct-line` element/styles used by the contact timeline animation.
- Added `docs/static-qa-checklist.md`.
- Removed the duplicated Angular legacy root-level `mockvideo.png` after confirming the active reference uses `assets/images/mockvideo.png`.

Remaining Phase 1 items:

1. Run full visual QA in a browser with network access to CDN libraries.
2. Fix documentation/comment encoding issues where practical.
3. Confirm mobile layout and text wrapping.

Phase 2 has also started. Completed items:

- Created `apps/site` as an Angular SSR app.
- Installed `three` and `gsap`.
- Added an initial landing route.
- Added a browser-only `ExperienceEngine` lifecycle shell.
- Added section state contracts matching the current static experience.
- Copied local assets into `apps/site/public`.
- Confirmed `npm run build` succeeds outside the sandbox.
- Ported the first real Three.js particle-head renderer into the Angular engine.
- Added shader and surface-sampling modules for the Angular implementation.
- Added engine loading progress callbacks.
- Added the Angular landing loader, header, and first hero entrance/typewriter sequence.
- Ported the Home wheel-driven zoom transition into the Angular landing route.
- Added light-section overlay transition and reverse transition from Us back to Home.
- Added scroll-based section activation for the Angular migration.
- Ported About counters.
- Ported Services chat reveal and typewriter interaction.
- Ported Contact timeline reveal and final CTA.
- Reduced the initial Angular particle sampling density to keep the loader responsive while the sampler is still allocation-heavy.
- Verified the Angular route reaches `data-experience-ready="mounted"` with one canvas and no console errors in the in-app browser.
- Captured the static Home reference through the in-app browser.
- Improved Angular Home parity for fonts, header logo, hero emphasis, CTA arrow, and typography spacing.
- Pivoted to a parity-first bridge: copied the complete static experience into `apps/site/public/legacy`.
- The Angular landing route now embeds `/legacy/index.html` full-screen so the current production-quality design, head rendering, and choreography remain intact while modularization continues.

Next Angular migration items:

1. Treat `/legacy/index.html` as the visual baseline inside Angular.
2. Extract the legacy script into Angular modules one behavior at a time without changing visual output.
3. Optimize the Angular surface sampler before replacing the legacy particle renderer.
4. Add route-level shell/platform features around the parity bridge.
5. Remove the iframe only after module-by-module parity is verified.
