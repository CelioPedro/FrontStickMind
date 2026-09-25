# 6. Scroll Animations (GSAP)

GSAP `ScrollTrigger` is the backbone of the page flow.

Instead of animating CSS directly on scroll, ScrollTrigger observes `.section` intersections.
When a section hits `top 60%`, `sectionActivation.activate(idx)` is fired.
This triggers:
1. `gsap.to(currentCamState, ...)`: Rotates and moves the 3D camera to the predefined offsets for that specific section.
2. Section-specific JS classes add `is-active` to trigger CSS fades.
