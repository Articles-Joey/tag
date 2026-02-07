import { usePeerStore } from '@/hooks/usePeerStore';
import SpacesuitModel from '../Models/Spacesuit';
import { useMemo } from 'react';

export default function Players() {

    const gameState = usePeerStore(state => state.gameState);
    const peer = usePeerStore(state => state.peer);

    const otherPlayers = useMemo(() => {
        if (!gameState?.players || !peer?.id) return [];
        return gameState.players.filter(p => p.id !== peer.id).filter(p => p.position);
    }, [gameState?.players, peer?.id]);

    return (
        <>
            {otherPlayers.map(player => (
                <group key={player.id} position={player.position}>
                    <SpacesuitModel
                        scale={0.5}
                        position={[0, -0.3, 0]}
                        action="Idle"
                    />
                     {/* Player Label */}
                     {/* <mesh position={[0, 2, 0]}>
                        <textGeometry args={[player.id, { size: 0.5, height: 0.1 }]} />
                        <meshBasicMaterial color="white" />
                    </mesh> */}
                </group>
            ))}
        </>
    )
}