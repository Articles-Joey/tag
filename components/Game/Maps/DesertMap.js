import { useMemo } from 'react';
import { NearestFilter, RepeatWrapping, TextureLoader } from "three";
import { SphereGeometry } from "three";
import { useCylinder, useSphere, useTrimesh } from "@react-three/cannon";

import Ground from "../Ground";
import Dummy from "../Dummy";
import { useStore } from '@/hooks/useStore';

const sandTexture = new TextureLoader().load(`${process.env.NEXT_PUBLIC_CDN}games/US Tycoon/Textures/GroundSand005/GroundSand005_COL_1K.jpg`)

// Seeded random for consistent obstacle placement
const seededRandom = (seed) => {
    let m = 0x80000000;
    let a = 1103515245;
    let c = 12345;
    let state = seed ? seed : Math.floor(Math.random() * (m - 1));
    return () => {
        state = (a * state + c) % m;
        return state / (m - 1);
    }
}

const SandPlane = () => {
    const width = 110;
    const height = 110;

    sandTexture.magFilter = NearestFilter;
    sandTexture.wrapS = RepeatWrapping;
    sandTexture.wrapT = RepeatWrapping;
    sandTexture.repeat.set(20, 20);

    return (
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
            <circleGeometry attach="geometry" args={[width, height]} />
            <meshStandardMaterial attach="material" map={sandTexture} />
        </mesh>
    );
};

function Rock({ position, scale = 1 }) {
    const [ref] = useSphere(() => ({
        mass: 0,
        type: 'Static',
        position,
        args: [scale],
    }));

    return (
        <group ref={ref}>
            <mesh castShadow receiveShadow>
                <dodecahedronGeometry args={[scale, 1]} />
                <meshStandardMaterial color="#8B7355" roughness={0.9} />
            </mesh>
        </group>
    );
}

function Cactus({ position, height = 3 }) {
    const radius = 0.3;
    const segments = 8;

    const [ref] = useCylinder(() => ({
        mass: 0,
        type: 'Static',
        position: [position[0], height / 2, position[2]],
        args: [radius, radius, height, segments],
    }));

    return (
        <group ref={ref}>
            {/* Main trunk */}
            <mesh castShadow receiveShadow>
                <cylinderGeometry args={[radius, radius * 1.1, height, segments]} />
                <meshStandardMaterial color="#2D5A27" roughness={0.8} />
            </mesh>
            {/* Left arm */}
            <group position={[-radius * 1.5, height * 0.2, 0]} rotation={[0, 0, Math.PI / 4]}>
                <mesh castShadow>
                    <cylinderGeometry args={[radius * 0.7, radius * 0.8, height * 0.4, segments]} />
                    <meshStandardMaterial color="#2D5A27" roughness={0.8} />
                </mesh>
            </group>
            {/* Right arm */}
            <group position={[radius * 1.5, height * 0.35, 0]} rotation={[0, 0, -Math.PI / 4]}>
                <mesh castShadow>
                    <cylinderGeometry args={[radius * 0.7, radius * 0.8, height * 0.35, segments]} />
                    <meshStandardMaterial color="#2D5A27" roughness={0.8} />
                </mesh>
            </group>
        </group>
    );
}

function DesertRocks({ count = 40, seed = 11111 }) {
    const obstacles = useMemo(() => {
        const rng = seededRandom(seed);
        const items = [];
        for (let i = 0; i < count; i++) {
            const x = (rng() * 160) - 80;
            const z = (rng() * 160) - 80;
            const scale = 0.5 + rng() * 2.5;
            items.push({ position: [x, scale * 0.75, z], scale, key: i });
        }
        return items;
    }, [count, seed]);

    return (
        <>
            {obstacles.map((rock) => (
                <Rock key={rock.key} position={rock.position} scale={rock.scale} />
            ))}
        </>
    );
}

function Cacti({ count = 25, seed = 22222 }) {
    const graphicsQuality = useStore((state) => state.graphicsQuality);

    const cacti = useMemo(() => {
        const rng = seededRandom(seed);
        const items = [];
        const actualCount = graphicsQuality === 'Low' ? Math.floor(count / 3) : 
                           graphicsQuality === 'Medium' ? Math.floor(count * 2 / 3) : count;
        for (let i = 0; i < actualCount; i++) {
            const x = (rng() * 160) - 80;
            const z = (rng() * 160) - 80;
            const height = 2 + rng() * 3;
            items.push({ position: [x, 0, z], height, key: i });
        }
        return items;
    }, [count, seed, graphicsQuality]);

    return (
        <>
            {cacti.map((c) => (
                <Cactus key={c.key} position={c.position} height={c.height} />
            ))}
        </>
    );
}

function Dune({ position, scale }) {
    // Build trimesh from the same half-sphere geometry with scale baked in,
    // so collision matches the visual exactly including non-uniform XZ scale.
    const [vertices, indices] = useMemo(() => {
        const geo = new SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        geo.scale(scale[0], scale[1], scale[2]);
        const verts = Array.from(geo.attributes.position.array);
        const idx = Array.from(geo.index.array);
        geo.dispose();
        return [verts, idx];
    }, [scale]);

    const [ref] = useTrimesh(() => ({
        mass: 0,
        type: 'Static',
        position: [position[0], 0, position[2]],
        args: [vertices, indices],
    }));

    return (
        <>
            {/* Invisible physics body */}
            <mesh ref={ref} />
            {/* Visual mesh */}
            <mesh position={[position[0], 0, position[2]]} scale={scale} receiveShadow>
                <sphereGeometry args={[1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color="#C2B280" roughness={1} />
            </mesh>
        </>
    );
}

function Dunes() {
    const graphicsQuality = useStore((state) => state.graphicsQuality);

    const dunes = useMemo(() => {
        const rng = seededRandom(33333);
        const count = graphicsQuality === 'Low' ? 5 : graphicsQuality === 'Medium' ? 10 : 15;
        const items = [];
        for (let i = 0; i < count; i++) {
            const x = (rng() * 160) - 80;
            const z = (rng() * 160) - 80;
            const scaleX = 8 + rng() * 12;
            const scaleY = 1 + rng() * 2;
            const scaleZ = 8 + rng() * 12;
            items.push({ position: [x, 0, z], scale: [scaleX, scaleY, scaleZ], key: i });
        }
        return items;
    }, [graphicsQuality]);

    return (
        <>
            {dunes.map((dune) => (
                <Dune key={dune.key} position={dune.position} scale={dune.scale} />
            ))}
        </>
    );
}

export default function DesertMap() {
    return (
        <>
            {/* Physics ground */}
            <Ground />
            <Dummy />

            {/* Desert obstacles */}
            <DesertRocks />
            <Cacti />
            <Dunes />

            {/* Ground texture */}
            <SandPlane />

            {/* Backdrop */}
            <mesh
                receiveShadow
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -0.1, 0]}
            >
                <circleGeometry args={[200, 64]} />
                <meshStandardMaterial color="#D2B48C" />
            </mesh>
        </>
    );
}
