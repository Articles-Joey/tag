import { usePeerStore } from '@/hooks/usePeerStore';

export default function PeerDetails() {

    const peer = usePeerStore(state => state.peer)
    const isHost = usePeerStore(state => state.isHost)
    const gameState = usePeerStore(state => state.gameState)

    if (!peer) return null;

    return (
        <div className="card card-articles card-sm">
            <div className="card-body">
                <div className="small text-muted">Multiplayer</div>
                
                <div className="d-flex justify-content-between align-items-center">
                    <span>ID: <span className="fw-bold h5 mb-0 text-primary">{peer.id}</span></span>
                    {isHost && <span className="badge bg-success">HOST</span>}
                </div>

                <div className="small text-muted mt-2">
                    Share this ID with friends to play together!
                </div>

                <div className="mt-3">
                    <div className="small text-muted mb-1">Players ({gameState?.players?.length || 0})</div>
                    <div className="list-group list-group-flush small">
                        {gameState?.players?.map(player => (
                            <div key={player.id} className="list-group-item px-0 py-1 d-flex justify-content-between">
                                <span className={player.id === peer.id ? "fw-bold" : ""}>
                                    {player.id === peer.id ? "You" : player.id}
                                </span>
                                <span className="text-muted font-monospace">
                                    {player.position?.map(c => Math.round(c)).join(', ')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}