import { useMemo } from 'react';
import * as THREE from 'three';

// A 3D Snowflake mark: six arms, each with a pair of chevron branches near the tip, around a hexagonal
// hub, extruded with bevelled edges. Drawn once as a 2D shape and extruded, so it is one mesh.
function armShape() {
  const s = new THREE.Shape();
  const w = 0.11;                  // half width of the main arm
  s.moveTo(-w, 0.18); s.lineTo(-w, 1.0); s.lineTo(0, 1.12); s.lineTo(w, 1.0); s.lineTo(w, 0.18); s.lineTo(-w, 0.18);
  return s;
}
function chevron(y: number, len: number) {
  // a V opening toward the tip, built as a thick polyline
  const s = new THREE.Shape(); const t = 0.085;
  s.moveTo(-len, y + len * 0.9); s.lineTo(0, y); s.lineTo(len, y + len * 0.9);
  s.lineTo(len - t, y + len * 0.9 + t * 0.8); s.lineTo(0, y + t * 1.6); s.lineTo(-len + t, y + len * 0.9 + t * 0.8);
  s.lineTo(-len, y + len * 0.9);
  return s;
}

export default function Snowflake3D({ size = 1, color = '#29b5e8', emissive = 0.45 }: { size?: number; color?: string; emissive?: number }) {
  const geometry = useMemo(() => {
    const shapes: THREE.Shape[] = [];
    for (let i = 0; i < 6; i++) {
      const rot = new THREE.Matrix3().makeRotation((i * Math.PI) / 3);
      for (const s of [armShape(), chevron(0.62, 0.26), chevron(0.36, 0.18)]) {
        const pts = s.getPoints().map((p) => p.clone().applyMatrix3(rot));
        shapes.push(new THREE.Shape(pts));
      }
    }
    // hexagonal hub with a hole, like the logo's centre
    const hub = new THREE.Shape(); const hole = new THREE.Path();
    for (let i = 0; i <= 6; i++) {
      const a = (i * Math.PI) / 3 + Math.PI / 6;
      const [x, y, hx, hy] = [Math.cos(a) * 0.26, Math.sin(a) * 0.26, Math.cos(a) * 0.12, Math.sin(a) * 0.12];
      if (i === 0) { hub.moveTo(x, y); hole.moveTo(hx, hy); } else { hub.lineTo(x, y); hole.lineTo(hx, hy); }
    }
    hub.holes.push(hole); shapes.push(hub);
    const g = new THREE.ExtrudeGeometry(shapes, { depth: 0.16, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.025, bevelSegments: 2, curveSegments: 4 });
    g.center();
    return g;
  }, []);
  return (
    <mesh geometry={geometry} scale={size} castShadow>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emissive} metalness={0.45} roughness={0.25} />
    </mesh>
  );
}
