# 8. Mobile Responsiveness

Mobile introduces Safari flexbox bugs and viewport height inconsistencies (`100vh` vs UI bars).

- **Layout Changes**: Side-by-side elements stack vertically.
- **Flexbox Collapse**: Fixed by changing flex-basis to `none` and using `display: block` on sections like `#contact`.
- **Internal Scrolling**: Sections that exceed 100vh (like Contact) use `overflow-y: auto; -webkit-overflow-scrolling: touch;` to allow content browsing without breaking the global GSAP section snapping.
