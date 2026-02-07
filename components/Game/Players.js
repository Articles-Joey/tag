import { usePeerStore } from '@/hooks/usePeerStore';
import { useMemo } from 'react';
import RemotePlayer from './RemotePlayer';

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
                <RemotePlayer key={player.id} player={player} />
            ))}
        </>
    )
}