# 7. Entrance Animations

The initial load sequence is handled by `entrance-animation.js`.

1. **Overlay**: A dark overlay keeps the screen hidden while Three.js parses the mesh.
2. **Camera Dolly**: The camera starts zoomed in and dollies out to the hero position.
3. **Typography**: The hero title and eyebrow text animate upwards using `power3.out`.
4. **Completion**: Restores `pointer-events: auto` to allow scrolling and interaction.
