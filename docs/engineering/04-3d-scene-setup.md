# 4. 3D Scene Setup

Three.js is used to render the particle head.

- **Scene**: Initialized in `script.js`.
- **Camera**: `PerspectiveCamera` with reactive FOV based on window size to prevent distortion on ultra-wide or mobile screens.
- **Renderer**: `WebGLRenderer` with `alpha: true` and `antialias: true`.
- **Post-processing**: Optional UnrealBloomPass for the glowing effect on particles, optimized to run only on high-end devices.
