export const particleVertexShader = `
precision highp float;

attribute float aRandom;
attribute vec3 aNormal;

uniform float uTime;
uniform float uSize;
uniform vec3 uMouse;
uniform float uMouseRadius;
uniform float uMouseForce;
uniform float uBreathing;

varying float vAlpha;
varying float vRandom;
varying float vDepth;
varying float vLighting;

void main() {
  vec3 pos = position;

  float breathCycle = sin(uTime * 1.5) * 0.5 + 0.5;
  float breathScale = 1.0 + (breathCycle * uBreathing);
  pos *= breathScale;
  pos.y += breathCycle * 2.5;

  float distToMouse = distance(pos, uMouse);
  if (distToMouse < uMouseRadius) {
    float f = 1.0 - distToMouse / uMouseRadius;
    f = f * f * f;
    vec3 dir = normalize(pos - uMouse);
    pos += dir * uMouseForce * f * 25.0;
  }

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  vec3 worldNormal = normalize(mat3(modelViewMatrix) * aNormal);
  float facing = dot(worldNormal, vec3(0.0, 0.0, 1.0));
  float backfaceFade = smoothstep(-0.05, 0.15, facing);
  float zFade = smoothstep(-8.0, 8.0, position.z);
  float rimFade = smoothstep(0.0, 0.35, facing);

  vec3 lightDir = normalize(vec3(-0.6, 0.4, 0.8));
  float diffuse = max(dot(worldNormal, lightDir), 0.0);
  vLighting = 0.25 + diffuse * 0.75;
  vAlpha = zFade * backfaceFade * (0.4 + 0.6 * rimFade);
  vRandom = aRandom;
  vDepth = -mvPosition.z;

  float sizeAtten = 300.0 / -mvPosition.z;
  float randomSize = uSize * (0.8 + aRandom * 0.4);
  gl_PointSize = clamp(randomSize * sizeAtten, 0.5, 35.0);
  if (vAlpha < 0.005) gl_PointSize = 0.0;

  gl_Position = projectionMatrix * mvPosition;
}
`;

export const particleFragmentShader = `
precision highp float;

varying float vAlpha;
varying float vRandom;
varying float vDepth;
varying float vLighting;

void main() {
  if (vAlpha < 0.01) discard;

  float r = distance(gl_PointCoord, vec2(0.5));
  float core = smoothstep(0.3, 0.05, r);
  float glow = smoothstep(0.5, 0.15, r);
  float mask = core * 0.85 + glow * 0.35;
  if (mask < 0.01) discard;

  vec3 deepPurple = vec3(0.12, 0.06, 0.22);
  vec3 lavenderNeon = vec3(0.65, 0.52, 0.85);
  vec3 hotGlow = vec3(0.88, 0.78, 0.95);

  float brightness = 0.55 + vRandom * 0.15;
  vec3 color = mix(deepPurple, lavenderNeon * brightness * 1.6, vLighting);
  color = mix(color, hotGlow, core * 0.4 * vLighting);
  color *= 0.8 + core * 0.5;

  float finalAlpha = mask * vAlpha;
  finalAlpha *= smoothstep(600.0, 200.0, vDepth);

  gl_FragColor = vec4(color, finalAlpha);
}
`;
