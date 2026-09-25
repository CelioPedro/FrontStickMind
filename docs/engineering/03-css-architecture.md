# 3. CSS Architecture

We use a flat CSS file (`style.css`) heavily utilizing CSS Variables (`:root`) for easy theming.

## Tokens
- `--color-bg-dark`: `#050208`
- `--color-accent-purple`: `#c77dff`
- `--z-ui`: Handles stacking contexts (cursor, header, overlay).

## Scroll Snapping
The desktop layout relies on `#scroll-container` with `scroll-snap-type: y proximity` and `.section` with `scroll-snap-align: start`. This forces the viewport to snap perfectly into 100vh sections, aligning the 3D camera.
