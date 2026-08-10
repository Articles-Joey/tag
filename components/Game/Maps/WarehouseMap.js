import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import { Raycaster, Vector3 } from 'three';

import Ground from '../Ground';
import Dummy from '../Dummy';
import { useTagGameStore } from '@/hooks/useTagGameStore';

const WAREHOUSE_SIZE = 48 * 2;
const WAREHOUSE_HEIGHT = 9;
const WAREHOUSE_SEED = 'test';
const SHELF_SPACING = 14;
const SHELF_SCALE = 1;
const SHELF_WIDTH = 10;
const SHELF_DEPTH = 2.4;
const SHELF_LEVELS = 4;
const SHELF_LEVEL_SPACING = 2.1;

const floorVertexShader = `
    varying vec3 vWorldPosition;

    void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
`;

const floorFragmentShader = `
    varying vec3 vWorldPosition;

    float hash(vec2 point) {
        return fract(sin(dot(point, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
        vec2 gridPosition = vWorldPosition.xz * 0.45;
        vec2 tile = floor(gridPosition);
        vec2 grid = fract(gridPosition);
        float seam = step(0.94, max(grid.x, grid.y));
        float variation = hash(tile) * 0.08;
        vec3 concrete = vec3(0.23, 0.27, 0.25) + variation;
        vec3 wornSeam = vec3(0.08, 0.1, 0.09);
        gl_FragColor = vec4(mix(concrete, wornSeam, seam), 1.0);
    }
`;

const ceilingFragmentShader = `
    varying vec3 vWorldPosition;

    void main() {
        vec2 panel = abs(fract(vWorldPosition.xz * 0.16) - 0.5);
        float seam = step(0.47, max(panel.x, panel.y));
        vec3 metal = vec3(0.35, 0.38, 0.37);
        vec3 shadow = vec3(0.19, 0.21, 0.2);
        gl_FragColor = vec4(mix(metal, shadow, seam), 1.0);
    }
`;

function hashSeed(seed) {
    let hash = 2166136261;

    for (let index = 0; index < seed.length; index += 1) {
        hash ^= seed.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }

    return hash >>> 0;
}

function seededRandom(seed) {
    let state = hashSeed(seed);

    return () => {
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
        return state / 4294967296;
    };
}

function axisPositions(size, spacing, margin) {
    const positions = [];

    for (let position = -size / 2 + margin; position <= size / 2 - margin; position += spacing) {
        positions.push(position);
    }

    return positions;
}

function StaticBox({ position, args, color = '#4b5552', rotation = [0, 0, 0], metalness = 0, roughness = 0.7 }) {
    const [ref] = useBox(() => ({
        mass: 0,
        type: 'Static',
        position,
        rotation,
        args,
    }));

    return (
        <mesh ref={ref} castShadow receiveShadow>
            <boxGeometry args={args} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
        </mesh>
    );
}

function Wall({ position, args, color = '#69716d', wallRefs, wallIndex }) {
    const [ref] = useBox(() => ({
        mass: 0,
        type: 'Static',
        position,
        args,
    }));

    useEffect(() => {
        wallRefs.current[wallIndex] = ref.current;

        return () => {
            wallRefs.current[wallIndex] = null;
        };
    }, [ref, wallIndex, wallRefs]);

    return (
        <mesh ref={ref} castShadow receiveShadow userData={{ warehouseWall: true }}>
            <boxGeometry args={args} />
            <meshStandardMaterial color={color} roughness={0.85} transparent opacity={1} />
        </mesh>
    );
}

function WallOcclusion({ wallRefs }) {
    const camera = useThree((state) => state.camera);
    const raycaster = useMemo(() => new Raycaster(), []);
    const direction = useMemo(() => new Vector3(), []);

    useFrame((_, delta) => {
        const playerPosition = useTagGameStore.getState().position;
        const walls = wallRefs.current.filter(Boolean);

        if (!playerPosition || walls.length === 0) return;

        direction.set(
            playerPosition[0] - camera.position.x,
            playerPosition[1] - camera.position.y,
            playerPosition[2] - camera.position.z,
        );

        const distanceToPlayer = direction.length();
        if (distanceToPlayer === 0) return;

        direction.normalize();
        raycaster.set(camera.position, direction);

        const occludedWalls = new Set(
            raycaster
                .intersectObjects(walls, false)
                .filter((intersection) => intersection.distance < distanceToPlayer)
                .map((intersection) => intersection.object),
        );

        walls.forEach((wall) => {
            const material = wall.material;
            const targetOpacity = occludedWalls.has(wall) ? 0.18 : 1;
            material.opacity += (targetOpacity - material.opacity) * Math.min(1, delta * 12);
            material.depthWrite = material.opacity > 0.5;
        });
    });

    return null;
}

function Beam({ position, args, rotation = [0, 0, 0] }) {
    return (
        <StaticBox
            position={position}
            args={args}
            rotation={rotation}
            color="#343b3a"
            metalness={0.75}
            roughness={0.35}
        />
    );
}

function Bricks({ scale = 1 }) {
    const bricks = [
        [-0.55, 0.16, 0, 0],
        [0, 0.16, 0, 0],
        [0.55, 0.16, 0, 0],
        [-0.28, 0.48, 0.03, 0.04],
        [0.28, 0.48, -0.03, -0.04],
    ];

    return (
        <group scale={scale}>
            {bricks.map(([x, y, z, rotation], index) => (
                <mesh key={index} position={[x, y, z]} rotation={[0, rotation, 0]} castShadow>
                    <boxGeometry args={[0.48, 0.28, 0.72]} />
                    <meshStandardMaterial color={index % 2 ? '#9d4532' : '#b9553d'} roughness={0.9} />
                </mesh>
            ))}
        </group>
    );
}

function Wood({ scale = 1 }) {
    return (
        <group scale={scale}>
            <mesh position={[0, 0.34, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.25, 0.68, 0.9]} />
                <meshStandardMaterial color="#9a6336" roughness={0.85} />
            </mesh>
            {[[-0.48, 0, 0.46], [0.48, 0, 0.46], [-0.48, 0, -0.46], [0.48, 0, -0.46]].map((position, index) => (
                <mesh key={index} position={[position[0], 0.36, position[2]]} castShadow>
                    <boxGeometry args={[0.12, 0.72, 0.12]} />
                    <meshStandardMaterial color="#5f3c25" roughness={0.9} />
                </mesh>
            ))}
            <mesh position={[0, 0.7, 0]} castShadow>
                <boxGeometry args={[1.3, 0.08, 0.95]} />
                <meshStandardMaterial color="#c18a50" roughness={0.8} />
            </mesh>
        </group>
    );
}

function CaseOfWater({ scale = 1 }) {
    return (
        <group scale={scale}>
            <mesh position={[0, 0.38, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.35, 0.75, 0.95]} />
                <meshStandardMaterial color="#d7d1b8" roughness={0.75} />
            </mesh>
            <mesh position={[0, 0.77, 0]} castShadow>
                <boxGeometry args={[1.42, 0.08, 1.02]} />
                <meshStandardMaterial color="#3e83a2" roughness={0.65} />
            </mesh>
            {[[-0.4, 0.82, -0.28], [0, 0.82, -0.28], [0.4, 0.82, -0.28], [-0.2, 0.82, 0.28], [0.2, 0.82, 0.28]].map((position, index) => (
                <mesh key={index} position={position} castShadow>
                    <cylinderGeometry args={[0.13, 0.13, 0.18, 8]} />
                    <meshStandardMaterial color="#7dc0d1" roughness={0.25} metalness={0.05} />
                </mesh>
            ))}
        </group>
    );
}

const itemComponents = {
    bricks: Bricks,
    wood: Wood,
    water: CaseOfWater,
};

function RandomItem({ type, position, scale = 1, rotation = [0, 0, 0] }) {
    const ItemComponent = itemComponents[type] || Wood;

    return (
        <group position={position} rotation={rotation}>
            <ItemComponent scale={scale} />
        </group>
    );
}

function Shelf({ position, scale = 1, seed, shelfIndex }) {
    const shelfArgs = [SHELF_WIDTH * scale, 0.18 * scale, SHELF_DEPTH * scale];
    const items = useMemo(() => {
        const random = seededRandom(`${seed}:shelf:${shelfIndex}`);
        const availableTypes = ['bricks', 'wood', 'water'];
        const count = 1 + Math.floor(random() * 3);

        return Array.from({ length: count }, (_, index) => ({
            type: availableTypes[Math.floor(random() * availableTypes.length)],
            position: [
                (random() - 0.5) * (SHELF_WIDTH * scale - 2),
                0.18 * scale,
                (random() - 0.5) * (SHELF_DEPTH * scale - 0.6),
            ],
            scale: (0.65 + random() * 0.25) * scale,
            rotation: [0, (Math.floor(random() * 4) * Math.PI) / 2, 0],
            key: `${seed}-${shelfIndex}-${index}`,
        }));
    }, [scale, seed, shelfIndex]);

    return (
        <>
            <StaticBox position={position} args={shelfArgs} color="#c58b48" metalness={0.25} roughness={0.55} />
            {items.map((item) => (
                <RandomItem
                    key={item.key}
                    type={item.type}
                    position={[position[0] + item.position[0], position[1] + item.position[1], position[2] + item.position[2]]}
                    scale={item.scale}
                    rotation={item.rotation}
                />
            ))}
        </>
    );
}

function Rack({ position, scale = 1, seed, rackIndex }) {
    const rackHeight = (SHELF_LEVELS - 1) * SHELF_LEVEL_SPACING + 1.1;
    const postArgs = [0.22 * scale, rackHeight * scale, 0.22 * scale];
    const postX = (SHELF_WIDTH / 2 - 0.25) * scale;
    const postZ = (SHELF_DEPTH / 2 - 0.18) * scale;
    const shelves = Array.from({ length: SHELF_LEVELS }, (_, level) => level);

    return (
        <>
            {[[-postX, rackHeight * scale / 2, -postZ], [postX, rackHeight * scale / 2, -postZ], [-postX, rackHeight * scale / 2, postZ], [postX, rackHeight * scale / 2, postZ]].map((post, index) => (
                <Beam key={index} position={[position[0] + post[0], post[1], position[2] + post[2]]} args={postArgs} />
            ))}
            {shelves.map((level) => (
                <Shelf
                    key={level}
                    position={[position[0], (0.75 + level * SHELF_LEVEL_SPACING) * scale, position[2]]}
                    scale={scale}
                    seed={seed}
                    shelfIndex={`${rackIndex}-${level}`}
                />
            ))}
        </>
    );
}

function Racks() {
    const rackPositions = useMemo(() => {
        const positions = [];
        const axis = axisPositions(WAREHOUSE_SIZE, SHELF_SPACING, 6);

        axis.forEach((x) => {
            axis.forEach((z) => {
                positions.push([x, 0, z]);
            });
        });

        return positions;
    }, []);

    return (
        <>
            {rackPositions.map((position, index) => (
                <Rack
                    key={index}
                    position={position}
                    scale={SHELF_SCALE}
                    seed={WAREHOUSE_SEED}
                    rackIndex={index}
                />
            ))}
        </>
    );
}

function CeilingStructure() {
    const beamPositions = axisPositions(WAREHOUSE_SIZE, SHELF_SPACING, 2);
    const beamHeight = WAREHOUSE_HEIGHT - 0.35;

    return (
        <>
            {beamPositions.map((position) => (
                <Beam key={`x-${position}`} position={[0, beamHeight, position]} args={[WAREHOUSE_SIZE, 0.35, 0.35]} />
            ))}
            {beamPositions.map((position) => (
                <Beam key={`z-${position}`} position={[position, beamHeight, 0]} args={[WAREHOUSE_SIZE, 0.35, 0.35]} rotation={[0, Math.PI / 2, 0]} />
            ))}
            {beamPositions.map((x) => beamPositions.map((z) => (
                <mesh key={`joint-${x}-${z}`} position={[x, beamHeight + 0.2, z]} castShadow>
                    <octahedronGeometry args={[0.28, 0]} />
                    <meshStandardMaterial color="#a77c39" metalness={0.8} roughness={0.3} />
                </mesh>
            )))}
        </>
    );
}

function WarehouseWalls() {
    const halfSize = WAREHOUSE_SIZE / 2;
    const wallThickness = 0.5;
    const wallRefs = useRef([]);

    return (
        <>
            <Wall
                position={[0, WAREHOUSE_HEIGHT / 2, -halfSize]}
                args={[WAREHOUSE_SIZE, WAREHOUSE_HEIGHT, wallThickness]}
                wallRefs={wallRefs}
                wallIndex={0}
            />
            <Wall
                position={[0, WAREHOUSE_HEIGHT / 2, halfSize]}
                args={[WAREHOUSE_SIZE, WAREHOUSE_HEIGHT, wallThickness]}
                color="#5d6763"
                wallRefs={wallRefs}
                wallIndex={1}
            />
            <Wall
                position={[-halfSize, WAREHOUSE_HEIGHT / 2, 0]}
                args={[wallThickness, WAREHOUSE_HEIGHT, WAREHOUSE_SIZE]}
                color="#626b67"
                wallRefs={wallRefs}
                wallIndex={2}
            />
            <Wall
                position={[halfSize, WAREHOUSE_HEIGHT / 2, 0]}
                args={[wallThickness, WAREHOUSE_HEIGHT, WAREHOUSE_SIZE]}
                color="#626b67"
                wallRefs={wallRefs}
                wallIndex={3}
            />
            <WallOcclusion wallRefs={wallRefs} />
        </>
    );
}

function WarehouseSurfaces() {
    return (
        <>
            <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
                <planeGeometry args={[WAREHOUSE_SIZE, WAREHOUSE_SIZE]} />
                <shaderMaterial vertexShader={floorVertexShader} fragmentShader={floorFragmentShader} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, WAREHOUSE_HEIGHT, 0]}>
                <planeGeometry args={[WAREHOUSE_SIZE, WAREHOUSE_SIZE]} />
                <shaderMaterial vertexShader={floorVertexShader} fragmentShader={ceilingFragmentShader} />
            </mesh>
        </>
    );
}

function WarehouseLights() {
    const lightPositions = axisPositions(WAREHOUSE_SIZE, SHELF_SPACING, 5);

    return (
        <>
            {lightPositions.map((x) => lightPositions.map((z) => (
                <group key={`${x}-${z}`} position={[x, WAREHOUSE_HEIGHT - 0.6, z]}>
                    <mesh castShadow>
                        <boxGeometry args={[2.2, 0.08, 0.8]} />
                        <meshStandardMaterial color="#e6e2d0" emissive="#fff0b4" emissiveIntensity={0.75} />
                    </mesh>
                    <pointLight position={[0, -0.3, 0]} intensity={18} distance={12} color="#fff0c4" />
                </group>
            )))}
        </>
    );
}

export default function WarehouseMap() {
    return (
        <>
            <Ground />
            <Dummy />
            <WarehouseSurfaces />
            <WarehouseWalls />
            <CeilingStructure />
            <Racks />
            <WarehouseLights />
            <ambientLight intensity={0.35} color="#dce8e2" />
        </>
    );
}