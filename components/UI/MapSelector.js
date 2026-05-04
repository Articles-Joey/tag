import { usePeerStore } from '@/hooks/usePeerStore';
import ArticlesButton from './Button';

const MAPS = [
    { id: 'Forest', label: 'Forest', icon: 'fa-trees' },
    { id: 'Desert', label: 'Desert', icon: 'fa-sun' },
    { id: 'Room', label: 'Room', icon: 'fa-home' },
];

export default function MapSelector({ onMapChange }) {
    const currentMap = usePeerStore(state => state.currentMap);
    const isHost = usePeerStore(state => state.isHost);
    const peer = usePeerStore(state => state.peer);

    return (
        <div className="card card-articles card-sm">
            <div className="card-body">
                <div className="small text-muted mb-1">Map Selection {!isHost && peer && <span>(Host only)</span>}</div>
                <div className="d-flex flex-wrap">
                    {MAPS.map(map => (
                        <ArticlesButton
                            key={map.id}
                            small
                            className="w-50"
                            active={currentMap === map.id}
                            disabled={!isHost && !!peer}
                            onClick={() => {
                                if (isHost || !peer) {
                                    onMapChange(map.id);
                                }
                            }}
                        >
                            <i className={`fad ${map.icon}`}></i>
                            <span>{map.label}</span>
                        </ArticlesButton>
                    ))}
                </div>
                {!isHost && peer && (
                    <div className="text-muted mt-1" style={{ fontSize: '0.75rem' }}>
                        Only the host can change the map.
                    </div>
                )}
            </div>
        </div>
    );
}
