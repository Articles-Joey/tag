import { useStore } from "@/hooks/useStore";
import { useCylinder } from "@react-three/cannon";
import { useMemo } from "react";
import { degToRad } from "three/src/math/MathUtils";

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

function Stump({ position, args, rotation }) {
    // args: [radiusTop, radiusBottom, height, segments]
    const [ref] = useCylinder(() => ({
        mass: 0, // Static object
        position,
        args,
        rotation,
        type: 'Static'
    }));

    const graphicsQuality = useStore((state) => state.graphicsQuality);

    const [radiusTop, radiusBottom, height, segments] = args;

    return (
        <group ref={ref}>

            {/* Bark (Outer Cylinder) */}
            <mesh castShadow receiveShadow>
                <cylinderGeometry args={args} />
                <meshStandardMaterial color="#463325" />
            </mesh>

            {graphicsQuality === 'High' &&
                <group>
                    {/* Wood (Inner Rings) */}
                    {/* Positioned on top face: y = height/2. Thin slice on top */}
                    <mesh position={[0, height / 2 + 0.01, 0]}>
                        {/* Top Cap: Slightly smaller radius, very thin */}
                        <cylinderGeometry args={[radiusTop * 0.85, radiusBottom * 0.85, 0.02, segments]} />
                        <meshStandardMaterial color="#C19A6B" />
                    </mesh>
                </group>
            }

            {graphicsQuality === 'Medium' &&
                <group>
                    {/* Top Cap: Flat circle */}
                    <mesh position={[0, height / 2 + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <circleGeometry args={[radiusTop * 0.85, segments]} />
                        <meshStandardMaterial color="#C19A6B" />
                    </mesh>
                </group>
            }

        </group>
    );
}

function FallenLog({ position, args, rotation }) {

    const [ref] = useCylinder(() => ({
        mass: 0,
        type: 'Static',
        position,
        args,
        rotation
    }));

    const graphicsQuality = useStore((state) => state.graphicsQuality);

    const [radiusTop, radiusBottom, height, segments] = args;

    return (
        <group ref={ref}>

            {/* Log Bark */}
            <mesh castShadow receiveShadow>
                <cylinderGeometry args={args} />
                <meshStandardMaterial color="#463325" />
            </mesh>
            {/* Log Ends (Wood Rings) */}

            {graphicsQuality === 'High' &&
                <group>
                    {/* Top End */}
                    <mesh position={[0, height / 2 + 0.01, 0]}>
                        <cylinderGeometry args={[radiusTop * 0.85, radiusBottom * 0.85, 0.02, segments]} />
                        <meshStandardMaterial color="#C19A6B" />
                    </mesh>

                    {/* Bottom End */}
                    <mesh position={[0, -height / 2 - 0.01, 0]} rotation={[Math.PI, 0, 0]}>
                        <cylinderGeometry args={[radiusTop * 0.85, radiusBottom * 0.85, 0.02, segments]} />
                        <meshStandardMaterial color="#C19A6B" />
                    </mesh>
                </group>
            }

            {graphicsQuality === 'Medium' &&
                <group>
                    {/* Top End */}
                    <mesh position={[0, height / 2 + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <circleGeometry args={[radiusTop * 0.85, segments]} />
                        <meshStandardMaterial color="#C19A6B" />
                    </mesh>

                    {/* Bottom End */}
                    <mesh position={[0, -height / 2 - 0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
                        <circleGeometry args={[radiusBottom * 0.85, segments]} />
                        <meshStandardMaterial color="#C19A6B" />
                    </mesh>
                </group>
            }

        </group>
    )
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

            // Fallen Log Logic (50% chance)
            const hasFallenLog = rng() < 0.5;
            let fallenLogConfig = null;

            if (hasFallenLog) {
                const logLength = height * 5;
                // Positioned on the ground, lying down.
                // Radius is same as stump.
                // Y position = radius (since it's lying on its side, radius is the vertical height from ground to center)
                const logY = radius;

                // Offset from stump. Move it away by radius (stump) + logLength/2 (center of log) + small gap?
                // Or "coming off it" usually means nearby.
                // Let's place it perpendicular to the timestamp or random direction? 
                // "Coming off of it" - let's pick a random direction from the stump center.
                const angle = rng() * Math.PI * 2;
                const distance = radius + (logLength / 2) + 0.2; // Push it out so they don't overlap too much

                const logX = x + Math.cos(angle) * distance;
                const logZ = z + Math.sin(angle) * distance;

                // Rotation: 
                // 1. Rotate X 90deg (Math.PI/2) to lay flat (aligns Y-up cylinder to Z-forward).
                // 2. Rotate Z (which is now global vertical axis relative to the object) to change orientation.

                fallenLogConfig = {
                    position: [logX, logY, logZ],
                    args: [radius, radius, logLength, segments],
                    rotation: [Math.PI / 2, 0, angle]
                };
            }

            items.push({
                position: [x, y, z],
                args: [radius, radius, height, segments],
                rotation,
                hasFallenLog,
                fallenLogConfig,
                key: i
            });
        }
        return items;
    }, [count, seed]);

    return (
        <>
            {obstacles.map((obs) => (
                <group key={obs.key}>
                    <Stump
                        position={obs.position}
                        args={obs.args}
                        rotation={obs.rotation}
                    />
                    {obs.hasFallenLog && obs.fallenLogConfig && (
                        <FallenLog
                            position={obs.fallenLogConfig.position}
                            args={obs.fallenLogConfig.args}
                            rotation={obs.fallenLogConfig.rotation}
                        />
                    )}
                </group>
            ))}
        </>
    );
}