# 2. File Structure

The project lives under `apps/site/public/legacy/`.

- `index.html`: The main entry point containing all sections.
- `style.css`: The global stylesheet handling desktop and mobile overrides.
- `script.js`: Global configuration, ScrollTrigger setup, and intersection observers.
- `render-loop.js`: The Three.js RAF (Request Animation Frame) manager.
- `entrance-animation.js`: The preloader and hero reveal sequence.
- `cursor.js`: Custom magnetic cursor logic.
- `sections/`: Contains specific logic for isolated sections (e.g., `contact-section.js`, `services-section.js`).
