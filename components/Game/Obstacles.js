import { useCylinder } from "@react-three/cannon";
import { useMemo } from "react";

// Simple seeded random number generator
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

function Obstacle({ position, args, rotation }) {
    // args: [radiusTop, radiusBottom, height, segments]
    const [ref] = useCylinder(() => ({
        mass: 0, // Static object
        position,
        args,
        rotation,
        type: 'Static'
    }));

    const [radiusTop, radiusBottom, height, segments] = args;

    return (
        <group ref={ref}>
            {/* Bark (Outer Cylinder) */}
            <mesh castShadow receiveShadow>
                <cylinderGeometry args={args} />
                <meshStandardMaterial color="#463325" /> 
            </mesh>
            {/* Wood (Inner Rings) */}
            {/* Positioned on top face: y = height/2. Thin slice on top */}
            <mesh position={[0, height / 2 + 0.01, 0]}>
                 {/* Top Cap: Slightly smaller radius, very thin */}
                <cylinderGeometry args={[radiusTop * 0.85, radiusBottom * 0.85, 0.02, segments]} />
                <meshStandardMaterial color="#C19A6B" /> 
            </mesh>
        </group>
    );
}

export default function Obstacles({ count = 100, seed = 67890 }) { // Default seed
    
    // Use useMemo to ensure obstacles are static for a given seed
    const obstacles = useMemo(() => {
        const rng = seededRandom(seed);
        const items = [];

        for (let i = 0; i < count; i++) {
            // Position: Random spread around map (-80 to 80)
            const x = (rng() * 160) - 80;
            const z = (rng() * 160) - 80;
            
            // Size logic: 0.8 to 5, mostly 0.8 to 1.1
            const isSmall = rng() < 0.85;
            let size;
            
            if (isSmall) {
                // Range 0.8 to 1.1
                size = 0.8 + (rng() * 0.3);
            } else {
                // Range 1.1 to 5
                size = 1.1 + (rng() * 3.9);
            }

            // Cylinder Dimensions
            const height = size;
            const radius = size / 2;
            const segments = 16;
            
            // Y position calculation:
            // Ground is at y=0. Cylinder origin is at center.
            // To sit on ground, y = height / 2.
            const y = height / 2;

            // Rotation: Random Y
            const rotY = rng() * Math.PI * 2;
            const rotation = [0, rotY, 0];

            items.push({
                position: [x, y, z],
                args: [radius, radius, height, segments],
                rotation,
                key: i
            });
        }
        return items;
    }, [count, seed]);

    return (
        <>
            {obstacles.map((obs) => (
                <Obstacle 
                    key={obs.key}
                    position={obs.position}
                    args={obs.args}
                    rotation={obs.rotation}
                />
            ))}
        </>
    );
}