import {
  BufferGeometry,
  BufferAttribute,
  Mesh,
  Object3D,
  Vector3,
} from 'three';

export interface SurfaceParticleData {
  readonly positions: number[];
  readonly normals: number[];
  readonly randoms: number[];
}

export function computeObjectCentroid(object: Object3D, scale: number): Vector3 {
  const centroid = new Vector3();
  let count = 0;

  object.traverse((child) => {
    if (child instanceof Mesh) {
      const position = child.geometry.getAttribute('position');

      for (let i = 0; i < position.count; i++) {
        centroid.x += position.getX(i) * scale;
        centroid.y += position.getY(i) * scale;
        centroid.z += position.getZ(i) * scale;
        count++;
      }
    }
  });

  return count > 0 ? centroid.divideScalar(count) : centroid;
}

export function sampleObjectSurface(
  object: Object3D,
  scale: number,
  subdivisions: number,
  centroid: Vector3,
): SurfaceParticleData {
  const allPositions: number[] = [];
  const allNormals: number[] = [];
  const allRandoms: number[] = [];

  object.traverse((child) => {
    if (!(child instanceof Mesh)) {
      return;
    }

    const geometry = child.geometry;
    if (!geometry.getAttribute('normal')) {
      geometry.computeVertexNormals();
    }

    const data = sampleGeometrySurface(geometry, scale, subdivisions, centroid);
    allPositions.push(...data.positions);
    allNormals.push(...data.normals);
    allRandoms.push(...data.randoms);
  });

  return {
    positions: allPositions,
    normals: allNormals,
    randoms: allRandoms,
  };
}

function sampleGeometrySurface(
  geometry: BufferGeometry,
  scale: number,
  subdivisions: number,
  centroid: Vector3,
): SurfaceParticleData {
  const positions: number[] = [];
  const normals: number[] = [];
  const randoms: number[] = [];
  const posAttr = geometry.getAttribute('position') as BufferAttribute;
  const normAttr = geometry.getAttribute('normal') as BufferAttribute | undefined;
  const indexAttr = geometry.index;
  const faceCount = indexAttr ? indexAttr.count / 3 : posAttr.count / 3;

  const getVertex = (idx: number) =>
    new Vector3(
      posAttr.getX(idx) * scale,
      posAttr.getY(idx) * scale,
      posAttr.getZ(idx) * scale,
    );

  const getNormal = (idx: number) => {
    if (!normAttr) {
      return new Vector3(0, 0, 1);
    }

    return new Vector3(
      normAttr.getX(idx),
      normAttr.getY(idx),
      normAttr.getZ(idx),
    ).normalize();
  };

  for (let f = 0; f < faceCount; f++) {
    const ia = indexAttr ? indexAttr.getX(f * 3) : f * 3;
    const ib = indexAttr ? indexAttr.getX(f * 3 + 1) : f * 3 + 1;
    const ic = indexAttr ? indexAttr.getX(f * 3 + 2) : f * 3 + 2;

    const vA = getVertex(ia);
    const vB = getVertex(ib);
    const vC = getVertex(ic);
    const nA = getNormal(ia);
    const nB = getNormal(ib);
    const nC = getNormal(ic);

    const faceCenter = new Vector3()
      .add(vA)
      .add(vB)
      .add(vC)
      .divideScalar(3);
    const faceNormal = new Vector3()
      .add(nA)
      .add(nB)
      .add(nC)
      .normalize();
    const toCentroid = centroid.clone().sub(faceCenter).normalize();
    const dot = faceNormal.dot(toCentroid);

    if (dot > 0.25) {
      continue;
    }

    const centerX = Math.abs(faceCenter.x) < 20;
    const middleY = faceCenter.y > -30 && faceCenter.y < 30;
    const backFace = faceCenter.z < 70;
    const interiorNormal = dot > -0.1;

    if (centerX && middleY && backFace && interiorNormal) {
      continue;
    }

    for (let s = 0; s < subdivisions; s++) {
      let r1 = Math.random();
      let r2 = Math.random();

      if (r1 + r2 > 1) {
        r1 = 1 - r1;
        r2 = 1 - r2;
      }

      const r3 = 1 - r1 - r2;
      const px = vA.x * r1 + vB.x * r2 + vC.x * r3;
      const py = vA.y * r1 + vB.y * r2 + vC.y * r3;
      const pz = vA.z * r1 + vB.z * r2 + vC.z * r3;
      const nx = nA.x * r1 + nB.x * r2 + nC.x * r3;
      const ny = nA.y * r1 + nB.y * r2 + nC.y * r3;
      const nz = nA.z * r1 + nB.z * r2 + nC.z * r3;
      const normal = new Vector3(nx, ny, nz).normalize();

      positions.push(px, py, pz);
      normals.push(normal.x, normal.y, normal.z);
      randoms.push(Math.random());
    }
  }

  return { positions, normals, randoms };
}
