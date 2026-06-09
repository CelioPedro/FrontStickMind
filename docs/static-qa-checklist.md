# Static Experience QA Checklist

Use this checklist after changes to the current static version in `teste head/`.

## Load And Assets

- Page loads without a stuck loading screen.
- `assets/models/head.obj` loads successfully.
- `assets/images/mockvideo.png` appears in the Us section.
- No missing asset errors appear in the console.
- CDN libraries load before `script.js`.

## 3D Renderer

- Canvas is visible and nonblank.
- Particle head appears after loading.
- Bloom is visible but not washing out text.
- Mouse movement affects the head only after the entrance sequence completes.
- Cursor light follows the mouse on desktop.

## Home

- Loader fades out.
- Hero eyebrow appears.
- Hero title typewriter completes.
- Header and navigation reveal after the hero sequence.
- Wheel scroll controls zoom instead of native scroll.
- Home content fades during zoom.

## Us Transition

- Full zoom triggers the light overlay transition.
- Header switches to light mode.
- Page lands on the Us section.
- Particle size is reduced during the light section.
- Scrolling back to the top reverses to Home.

## About

- Section content fades in.
- Three stat cards reveal in sequence.
- Numbers count up correctly.
- Head tracks each stat and returns to the About resting pose.

## Services

- First chat message reveals on entry.
- Wheel scroll reveals one message at a time.
- Chat typewriter does not resize bubbles while typing.
- Badges appear after entity messages finish typing.
- Scroll is released after all chat messages are visible.

## Contact

- Left header fades in.
- Timeline milestones reveal in sequence.
- Descriptions type out without layout shift.
- The continuous `.ct-line` grows as milestones complete.
- Contact CTA appears after the final milestone.
- Head tracks milestones and then the CTA.

## Responsive

- Header does not overlap content on mobile.
- Navigation hides on mobile.
- Chat bubbles fit inside the viewport.
- Timeline remains readable on mobile.
- Footer does not cover primary contact content.

## Final Checks

- No obvious text overlap.
- No horizontal scroll.
- No repeated one-time animations after normal section navigation.
- No console errors from Three.js, GSAP, ScrollTrigger, or asset loading.
