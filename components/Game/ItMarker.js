import { usePeerStore } from '@/hooks/usePeerStore';
import { useTagGameStore } from '@/hooks/useTagGameStore';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

export default function ItMarker() {
    const gameState = usePeerStore(state => state.gameState);
    const peer = usePeerStore(state => state.peer);
    
    // Get local player position from the local store
    // This is smoother than waiting for the network roundtrip if WE are "IT"
    const localPosition = useTagGameStore(state => state.position);

    const groupRef = useRef();

    useFrame((state) => {
        if (groupRef.current) {
            // Bobbing animation
            groupRef.current.position.y = 2.5 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
            // Spinning animation
            groupRef.current.rotation.y += 0.02;
        }
    });

    const itPlayerId = gameState?.itPlayerId;
    
    if (!itPlayerId || !gameState?.players) return null;

    let targetPosition;

    if (peer && itPlayerId === peer.id) {
        // use local position if we are IT
        targetPosition = localPosition;
    } else {
        const itPlayer = gameState.players.find(p => p.id === itPlayerId);
        if (itPlayer && itPlayer.position) {
            targetPosition = itPlayer.position;
        }
    }

    if (!targetPosition) return null;

    return (
        <group position={[targetPosition[0], targetPosition[1] + 0.5, targetPosition[2]]}>
            <group ref={groupRef}>
                {/* Arrow pointing down */}
                <group rotation={[Math.PI, 0, 0]}> 
                    {/* Cylinder Shaft */}
                    <mesh position={[0, 0.5, 0]}>
                        <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
                        <meshStandardMaterial color="red" />
                    </mesh>
                    {/* Cone Tip */}
                    <mesh position={[0, 1.25, 0]}>
                        <coneGeometry args={[0.2, 0.5, 16]} />
                        <meshStandardMaterial color="red" />
                    </mesh>
                </group>
            </group>
        </group>
    );
}
