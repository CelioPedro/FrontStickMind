# Technical decisions

This document records project-level decisions that should guide future implementation work.
It is intentionally short and practical: when a change touches architecture, animation, assets, or platform scope, update this file with the decision and the reason.

## Decision log

### 001 - Keep the legacy experience as the visual baseline

Status: accepted

The Angular app currently renders the original experience from `apps/site/public/legacy/index.html`.
This protects the current choreography, typography, 3D particle behavior, and section timing while the system is modularized.

Implications:

- Do not replace the iframe until the modular implementation matches the visual baseline.
- Use `/legacy` as the comparison target for visual QA.
- Prefer small changes that can be validated against one section or one animation at a time.

### 002 - Move animation constants before moving animation code

Status: accepted

Camera states, particle density, asset paths, and shader uniform defaults now live in `apps/site/public/legacy/config.js`.
This gives us a safer control surface before splitting the monolithic `script.js`.

Implications:

- Tune camera, particle, and uniform values through `config.js` first.
- Extract new configuration only when it directly reduces risk or improves clarity.
- Keep fallback values in `script.js` until the legacy runtime is fully module-managed.

### 003 - Angular is the platform shell, not the animation owner yet

Status: accepted

Angular should own routing, future platform structure, metadata, and integration surfaces.
The legacy runtime still owns the visible high-end landing experience until the engine boundary is stable.

Implications:

- New platform routes should be created in Angular.
- Legacy animation internals should be modularized before being rewritten as Angular lifecycle code.
- Experimental engine files under `apps/site/src/app/experience/engine/` should not be treated as production behavior until wired and visually verified.

## Decision template

Use this format for future entries:

```md
### NNN - Decision title

Status: proposed | accepted | replaced

Decision summary.

Implications:

- Practical impact.
- Risk or tradeoff.
- Follow-up action.
```
