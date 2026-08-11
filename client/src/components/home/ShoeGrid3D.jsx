import { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Image as ImagePlane, RoundedBox, Text } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';

/**
 * Section — 3D Shoes Grid (Figma 38:200), built with React Three Fiber.
 *
 * Each tile is a flip card, not a tile-plus-floating-overlay:
 *   - front face: the curated photo (client/public/assets/editorial/
 *     future-01..12.webp — see SHOWCASE in FutureSection)
 *   - back face: real 3D geometry (RoundedBox + drei <Text>), pre-rotated
 *     180° so it's hidden behind the front face until the whole tile flips
 *   - hovering flips the tile 180° on Y to reveal the back; leaving always
 *     eases rotation.y back toward its EXACT front (0) or back (π) target
 *
 * Previously the info panel was a separate drei <Html> card floating in
 * front of the tile, and rotation.y was `+= delta` for as long as the
 * pointer stayed over the tile with nothing driving it back down — so on
 * pointer-out the tile just stopped wherever that accumulator happened to
 * land, permanently skewed. Driving rotation toward a fixed target every
 * frame (same technique already used for scale) fixes both: there's no
 * separate card, and the tile always returns to flat.
 *
 * The card's thickness is ONE shared RoundedBox, not two. RoundedBox is a
 * solid box (it has real depth), not a one-sided plane — an early version
 * gave front and back their own full box each; a box rotated 180° on Y is
 * geometrically identical to itself, so both boxes occupied the same space
 * and z-fought, blanking out the photo entirely. The photo and the info
 * panel are instead two thin layers sitting just outside the shared box's
 * +z and -z faces, which is what actually keeps them visually separate.
 *
 * Hover detection lives on a separate, STATIC, invisible plane — not on the
 * card mesh that actually rotates and scales. Putting onPointerOver/Out
 * directly on the animating card creates a feedback loop: as it nears 90°
 * mid-flip its on-screen footprint shrinks to a sliver, the pointer falls
 * outside it, pointerOut fires, the rotation target snaps back toward 0,
 * the pointer re-enters, pointerOver fires again — a rapid oscillation that
 * reads as the card "vibrating". The hit-plane never moves, so the raycast
 * hit-test it drives is stable regardless of what the visible card is doing.
 */

const COLS = 3;
const PITCH = 1.12;
const DEPTH = 0.06;
const HIT_SIZE = 1.06; // covers the card at its largest (hovered) scale

function ShoeMesh({ position, item, hovered, onHover, onLeave, onNavigate }) {
  const group = useRef();
  const imageUrl = `/assets/editorial/${item.image}.webp`;

  useFrame((_, delta) => {
    if (!group.current) return;
    const targetScale = hovered ? 1.32 : 1;
    const s = group.current.scale.x;
    group.current.scale.setScalar(s + (targetScale - s) * Math.min(1, delta * 8));

    // rotation.y only ever eases toward 0 (front) or π (back) — never a free
    // accumulator — so it always settles flat, whichever way hover ends.
    const targetRotation = hovered ? Math.PI : 0;
    const ry = group.current.rotation.y;
    group.current.rotation.y = ry + (targetRotation - ry) * Math.min(1, delta * 7);
  });

  return (
    <group position={position}>
      {/* Stable hover surface — flat, unrotated, unscaled, always at the
          tile's home position. This is the only thing onPointerOver/Out
          listen on. */}
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover();
        }}
        onPointerOut={onLeave}
      >
        <planeGeometry args={[HIT_SIZE, HIT_SIZE]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Everything below is purely visual — it reacts to `hovered`, it
          never decides `hovered`. */}
      <group ref={group}>
        {/* The one physical card — just gives the tile its edge thickness. */}
        <RoundedBox args={[0.94, 0.94, DEPTH]} radius={0.06} smoothness={4}>
          <meshStandardMaterial color="#0A0A0A" roughness={0.6} metalness={0.05} />
        </RoundedBox>

        {/* Front — photo, a thin layer just past the box's +z face */}
        <ImagePlane
          url={imageUrl}
          scale={[0.82, 0.82]}
          position={[0, 0, DEPTH / 2 + 0.005]}
          transparent
          radius={0.04}
        />

        {/* Back — info, a thin layer just past the box's -z face, pre-rotated
            180° so it only faces the camera once this group has flipped. */}
        <group position={[0, 0, -(DEPTH / 2 + 0.005)]} rotation={[0, Math.PI, 0]}>
          <RoundedBox args={[0.9, 0.9, 0.01]} radius={0.05} smoothness={4}>
            <meshStandardMaterial color="#F5F4F0" roughness={0.5} emissive="#C6FF00" emissiveIntensity={0.05} />
          </RoundedBox>

          <Text
            position={[0, 0.14, 0.02]}
            fontSize={0.052}
            maxWidth={0.78}
            textAlign="center"
            color="#0A0A0A"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.02}
          >
            {item.name.toUpperCase()}
          </Text>

          {/* Real clickable geometry — R3F's own raycaster handles this, no
              DOM button and no Router context needed inside the canvas. */}
          <group
            position={[0, -0.14, 0.02]}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(`/products/${item.slug}`);
            }}
          >
            <RoundedBox args={[0.56, 0.13, 0.02]} radius={0.065} smoothness={4}>
              <meshStandardMaterial color="#0A0A0A" />
            </RoundedBox>
            <Text position={[0, 0, 0.02]} fontSize={0.045} color="#C6FF00" anchorX="center" anchorY="middle">
              Buy Now →
            </Text>
          </group>
        </group>
      </group>
    </group>
  );
}

function Grid({ items, onHoverChange, onNavigate }) {
  const [hovered, setHovered] = useState(null);

  const positions = useMemo(() => {
    const rows = Math.ceil(items.length / COLS);
    return items.map((_, i) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      return [(col - (COLS - 1) / 2) * PITCH, ((rows - 1) / 2 - row) * PITCH, 0];
    });
  }, [items]);

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 4, 6]} intensity={1.1} />
      <directionalLight position={[-4, -2, 3]} intensity={0.35} color="#C6FF00" />
      {items.map((item, i) => (
        <ShoeMesh
          key={item.id}
          item={item}
          position={positions[i]}
          hovered={hovered === i}
          onHover={() => {
            setHovered(i);
            onHoverChange(true);
          }}
          onLeave={() => {
            setHovered((h) => (h === i ? null : h));
            onHoverChange(false);
          }}
          onNavigate={onNavigate}
        />
      ))}
    </>
  );
}

export default function ShoeGrid3D({ items }) {
  const [pointer, setPointer] = useState(false);
  const navigate = useNavigate(); // real React tree, outside <Canvas> — safe to use here

  if (!items.length) return null;

  const rows = Math.ceil(items.length / COLS);

  return (
    <div className="relative h-full w-full" style={{ cursor: pointer ? 'pointer' : 'default' }}>
      <Canvas
        camera={{ position: [0, 0, Math.max(6.4, rows * 1.55)], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Grid items={items} onHoverChange={setPointer} onNavigate={navigate} />
      </Canvas>
    </div>
  );
}
