# Angular legacy visual QA

Use this checklist whenever a change touches the Angular shell, `/legacy`, global styles, public assets, 3D rendering, scroll behavior, or animation timing.

## Local target

Run the Angular app:

```bash
npm run start -- --host=127.0.0.1 --port=4200
```

Open:

```text
http://127.0.0.1:4200
```

Direct legacy comparison target:

```text
http://127.0.0.1:4200/legacy/index.html
```

## First viewport

- No white border or browser margin around the experience.
- Header is visible and aligned with the original.
- Logo icon, nav, and CTA are visible.
- Particle head loads and remains centered.
- Home title, eyebrow, and CTA match the baseline.
- No unexpected horizontal overflow.

## Loading and assets

- Loading screen reaches `Ready`.
- `assets/models/head.obj` loads.
- `assets/images/mockvideo.png` appears in the Us section.
- `config.js` loads before `script.js`.
- Console has no runtime errors.

## Choreography checkpoints

- Home entrance animation reveals text and header cleanly.
- Wheel on Home drives the zoom-dive transition.
- Transition overlay moves from dark Home to light Us without flashes.
- Reverse scroll from Us back to Home restores the dark state.
- About counters animate once and return the head to the expected pose.
- Services chat reveals one message sequence at a time.
- Contact timeline line and milestones animate in order.

## Responsive checkpoints

Test at minimum:

- Desktop: `1280 x 720`
- Wide desktop: `1440 x 900`
- Tablet-ish: `1024 x 768`
- Mobile: `390 x 844`

Confirm:

- Text does not overlap or clip.
- Header remains usable.
- CTA text fits.
- Particle head remains framed.
- Scroll transitions do not trap the user.

## Acceptance rule

A change is not complete until the affected section is checked against the direct legacy target and the Angular shell target.
