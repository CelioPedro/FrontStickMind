# 9. Contact Section Logic

The `contact-section.js` controls the journey timeline.

- **Typewriting Effect**: Custom logic parses the text content, hides it, and reveals characters iteratively for a terminal-like feel.
- **Auto-scroll (Mobile)**: Since the timeline exceeds mobile viewports, the script utilizes `element.scrollIntoView({ behavior: 'smooth', block: 'center' })` starting from the 3rd milestone, ensuring animations happen inside the user's viewport.
