import { useMemo } from 'react';
import { useBox } from "@react-three/cannon";
import Ground from "../Ground";
import Dummy from "../Dummy";
import { useStore } from '@/hooks/useStore';

function Wall({ position, args, color = "#E8E0D0" }) {
    const [ref] = useBox(() => ({
        mass: 0,
        type: 'Static',
        position,
        args,
    }));

    return (
        <mesh ref={ref} castShadow receiveShadow>
            <boxGeometry args={args} />
            <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
    );
}

function Doorway({ position, rotation = [0, 0, 0], width = 4, doorHeight = 4, wallHeight = 6, wallThickness = 0.5, color = "#E8E0D0" }) {
    const headerHeight = wallHeight - doorHeight;
    const headerY = position[1] + doorHeight + headerHeight / 2;

    return (
        <Header
            position={[position[0], headerY, position[2]]}
            rotation={rotation}
            args={[width, headerHeight, wallThickness]}
            color={color}
        />
    );
}

function Header({ position, rotation = [0, 0, 0], args, color }) {
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
            <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
    );
}

function Table({ position }) {
    const tableTopArgs = [4, 0.2, 2];
    const legArgs = [0.2, 1.5, 0.2];

    const [topRef] = useBox(() => ({
        mass: 0,
        type: 'Static',
        position: [position[0], position[1] + 1.5, position[2]],
        args: tableTopArgs,
    }));

    return (
        <group>
            {/* Table top */}
            <mesh ref={topRef} castShadow receiveShadow>
                <boxGeometry args={tableTopArgs} />
                <meshStandardMaterial color="#8B4513" roughness={0.6} />
            </mesh>
            {/* Legs */}
            {[[-1.7, 0.75, -0.7], [1.7, 0.75, -0.7], [-1.7, 0.75, 0.7], [1.7, 0.75, 0.7]].map((legPos, i) => (
                <mesh key={i} position={[position[0] + legPos[0], legPos[1], position[2] + legPos[2]]} castShadow>
                    <boxGeometry args={legArgs} />
                    <meshStandardMaterial color="#6B3410" roughness={0.6} />
                </mesh>
            ))}
        </group>
    );
}

function Chair({ position, rotation = [0, 0, 0] }) {
    const seatArgs = [1, 0.15, 1];

    // Physics body at world-space seat position; ref on the group so cannon
    // syncs the group transform — children use local coords relative to seat center.
    const [seatRef] = useBox(() => ({
        mass: 0,
        type: 'Static',
        position: [position[0], 1, position[2]],
        rotation,
        args: seatArgs,
    }));

    return (
        <group ref={seatRef}>
            {/* Seat */}
            <mesh castShadow receiveShadow>
                <boxGeometry args={seatArgs} />
                <meshStandardMaterial color="#A0522D" roughness={0.6} />
            </mesh>
            {/* Back — local offset from seat center */}
            <mesh position={[0, 0.7, -0.4]} castShadow>
                <boxGeometry args={[1, 1.2, 0.1]} />
                <meshStandardMaterial color="#A0522D" roughness={0.6} />
            </mesh>
            {/* Legs — local offsets; y=-0.5 because seat center is at world y=1, legs center at y=0.5 */}
            {[[-0.4, -0.5, -0.4], [0.4, -0.5, -0.4], [-0.4, -0.5, 0.4], [0.4, -0.5, 0.4]].map((legPos, i) => (
                <mesh key={i} position={legPos} castShadow>
                    <boxGeometry args={[0.1, 1, 0.1]} />
                    <meshStandardMaterial color="#6B3410" roughness={0.6} />
                </mesh>
            ))}
        </group>
    );
}

function Shelf({ position }) {
    const [ref] = useBox(() => ({
        mass: 0,
        type: 'Static',
        position,
        args: [3, 0.15, 0.8],
    }));

    return (
        <group>
            <mesh ref={ref} castShadow receiveShadow>
                <boxGeometry args={[3, 0.15, 0.8]} />
                <meshStandardMaterial color="#DEB887" roughness={0.5} />
            </mesh>
            {/* Bracket left */}
            <mesh position={[position[0] - 1.2, position[1] - 0.3, position[2]]} castShadow>
                <boxGeometry args={[0.1, 0.5, 0.6]} />
                <meshStandardMaterial color="#8B7355" />
            </mesh>
            {/* Bracket right */}
            <mesh position={[position[0] + 1.2, position[1] - 0.3, position[2]]} castShadow>
                <boxGeometry args={[0.1, 0.5, 0.6]} />
                <meshStandardMaterial color="#8B7355" />
            </mesh>
        </group>
    );
}

function Couch({ position, rotation = [0, 0, 0] }) {
    const seatArgs = [5, 1, 2];

    const [ref] = useBox(() => ({
        mass: 0,
        type: 'Static',
        position: [position[0], 0.5, position[2]],
        args: seatArgs,
        rotation,
    }));

    return (
        <group ref={ref}>
            {/* Seat base */}
            <mesh castShadow receiveShadow>
                <boxGeometry args={seatArgs} />
                <meshStandardMaterial color="#4A6741" roughness={0.8} />
            </mesh>
            {/* Back */}
            <mesh position={[0, 0.8, -0.9]} castShadow receiveShadow>
                <boxGeometry args={[5, 1.6, 0.3]} />
                <meshStandardMaterial color="#3D5636" roughness={0.8} />
            </mesh>
            {/* Left armrest */}
            <mesh position={[-2.3, 0.3, 0]} castShadow>
                <boxGeometry args={[0.4, 1, 2]} />
                <meshStandardMaterial color="#3D5636" roughness={0.8} />
            </mesh>
            {/* Right armrest */}
            <mesh position={[2.3, 0.3, 0]} castShadow>
                <boxGeometry args={[0.4, 1, 2]} />
                <meshStandardMaterial color="#3D5636" roughness={0.8} />
            </mesh>
        </group>
    );
}

function Pillar({ position }) {
    const args = [1, 6, 1];
    const [ref] = useBox(() => ({
        mass: 0,
        type: 'Static',
        position: [position[0], 3, position[2]],
        args,
    }));

    return (
        <mesh ref={ref} castShadow receiveShadow>
            <boxGeometry args={args} />
            <meshStandardMaterial color="#D4C5A9" roughness={0.6} />
        </mesh>
    );
}

const roomSize = 40;
const wallHeight = 6;
const wallThickness = 0.5;

export default function RoomMap() {
    const graphicsQuality = useStore((state) => state.graphicsQuality);

    return (
        <>
            {/* Floor (physics ground) */}
            <Ground />
            <Dummy />

            {/* Floor visual */}
            <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
                <planeGeometry args={[roomSize, roomSize]} />
                <meshStandardMaterial color="#8B7355" roughness={0.8} />
            </mesh>

            {/* Ceiling */}
            <mesh position={[0, wallHeight, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <planeGeometry args={[roomSize, roomSize]} />
                <meshStandardMaterial color="#F5F0E8" roughness={0.9} />
            </mesh>

            <RoomWalls />

            {/* Furniture */}
            <Table position={[8, 0, -10]} />
            <Table position={[-10, 0, 5]} />

            <Chair position={[7, 0, -12]} />
            <Chair position={[9, 0, -12]} />

            <Chair position={[-11, 0, 7]} rotation={[0, Math.PI, 0]} />
            <Chair position={[-9, 0, 7]} rotation={[0, Math.PI, 0]} />

            <Couch position={[0, 0, 5]} />
            <Couch position={[0, 0, 9]} rotation={[0, Math.PI, 0]}/>

            {/* Pillars */}
            <Pillar position={[-10, 0, -10]} />
            <Pillar position={[10, 0, -10]} />
            <Pillar position={[-10, 0, 10]} />
            <Pillar position={[10, 0, 10]} />

            {/* Shelves on walls */}
            {/* {graphicsQuality !== 'Low' && ( */}
            <>
                <Shelf position={[-12, 3.5, -roomSize / 2 + 0.5]} />

                <Shelf position={[8, 3, -roomSize / 2 + 0.5]} />

                <Shelf position={[4, 2, -roomSize / 2 + 0.5]} />

                <Shelf position={[8, 1, -roomSize / 2 + 0.5]} />

                <Shelf position={[12, 4, -roomSize / 2 + 0.5]} />


            </>
            {/* )} */}

            {/* Interior lights */}
            <pointLight position={[0, 5.5, 0]} intensity={100} color="#FFF5E1" />
            <pointLight position={[-15, 5, -15]} intensity={50} color="#FFF5E1" />
            <pointLight position={[15, 5, 15]} intensity={50} color="#FFF5E1" />
        </>
    );
}

function RoomWalls() {
    const doorWidth = 4;
    const halfRoomSize = roomSize / 2;
    const halfWallLength = (roomSize - doorWidth) / 2;
    const wallSectionCenter = doorWidth / 2 + halfWallLength / 2;

    return (
        <>
            {/* North wall */}
            <Wall
                position={[-wallSectionCenter, wallHeight / 2, -halfRoomSize]}
                args={[halfWallLength, wallHeight, wallThickness]}
                color="#E8E0D0"
            />
            <Doorway
                position={[0, 0, -halfRoomSize]}
                width={doorWidth}
                color="#E8E0D0"
            />
            <Wall
                position={[wallSectionCenter, wallHeight / 2, -halfRoomSize]}
                args={[halfWallLength, wallHeight, wallThickness]}
                color="#E8E0D0"
            />

            {/* South wall */}
            <Wall
                position={[-wallSectionCenter, wallHeight / 2, halfRoomSize]}
                args={[halfWallLength, wallHeight, wallThickness]}
                color="#E0D8C8"
            />
            <Doorway
                position={[0, 0, halfRoomSize]}
                width={doorWidth}
                color="#E0D8C8"
            />
            <Wall
                position={[wallSectionCenter, wallHeight / 2, halfRoomSize]}
                args={[halfWallLength, wallHeight, wallThickness]}
                color="#E0D8C8"
            />

            {/* East wall */}
            <Wall
                position={[halfRoomSize, wallHeight / 2, -wallSectionCenter]}
                args={[wallThickness, wallHeight, halfWallLength]}
                color="#DDD5C5"
            />
            <Doorway
                position={[halfRoomSize, 0, 0]}
                rotation={[0, Math.PI / 2, 0]}
                width={doorWidth}
                color="#DDD5C5"
            />
            <Wall
                position={[halfRoomSize, wallHeight / 2, wallSectionCenter]}
                args={[wallThickness, wallHeight, halfWallLength]}
                color="#DDD5C5"
            />

            {/* West wall */}
            <Wall
                position={[-halfRoomSize, wallHeight / 2, -wallSectionCenter]}
                args={[wallThickness, wallHeight, halfWallLength]}
                color="#E5DDD0"
            />
            <Doorway
                position={[-halfRoomSize, 0, 0]}
                rotation={[0, Math.PI / 2, 0]}
                width={doorWidth}
                color="#E5DDD0"
            />
            <Wall
                position={[-halfRoomSize, wallHeight / 2, wallSectionCenter]}
                args={[wallThickness, wallHeight, halfWallLength]}
                color="#E5DDD0"
            />
        </>
    );
}