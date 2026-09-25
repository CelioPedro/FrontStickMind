# 5. Particle System Shaders

The 3D head is not a standard mesh, but a `THREE.Points` cloud.

## Shaders
- **Vertex Shader**: Calculates point size based on distance from the camera. Includes logic for the "breathing" subtle sine-wave displacement.
- **Fragment Shader**: Uses a circular alpha mask to render round dots instead of squares. Implements proximity lighting based on a `u_cursor` uniform.

This ensures performance since GPU handles the millions of vertices instead of JS loops.
