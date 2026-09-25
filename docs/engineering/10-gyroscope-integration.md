# 10. Gyroscope Integration

For mobile devices, `mousemove` is unavailable. We implement `DeviceOrientationEvent`.

- **Permission**: iOS requires an explicit user gesture. A "Gyro Modal" is displayed on mobile load.
- **Mapping**: Pitch (beta) and Roll (gamma) are normalized between -1 and 1, then fed into the `targetCursor.x` and `targetCursor.y` variables.
- **Smoothing**: LERP (Linear Interpolation) smooths the noisy device sensors before passing them to the WebGL shader.
