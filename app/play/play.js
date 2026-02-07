"use client"
import { useEffect, useContext, useState, useRef, useMemo } from 'react';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic'
import Script from 'next/script'

// import { useSelector, useDispatch } from 'react-redux'

// import ROUTES from '@/components/constants/routes';

import ArticlesButton from '@/components/UI/Button';

import useFullscreen from '@/hooks/useFullScreen';
import { useControllerStore } from '@/hooks/useControllerStore';
// import ControllerPreview from '@/components/Games/ControllerPreview';
// import { useGameStore } from '@/components/Games/Ocean Rings/hooks/useGameStore';
// import { Dropdown, DropdownButton } from 'react-bootstrap';
// import TouchControls from 'app/(site)/community/games/glass-ceiling/components/UI/TouchControls';
import { useLocalStorageNew } from '@/hooks/useLocalStorageNew';
import LeftPanelContent from '@/components/UI/LeftPanel';
import { useSocketStore } from '@/hooks/useSocketStore';
import SprintMeter from '@/components/UI/SprintMeter';
import { useKeyboard } from "@/hooks/useKeyboard";
import { usePeerStore } from '@/hooks/usePeerStore';
import { useTagGameStore } from '@/hooks/useTagGameStore';

const GameCanvas = dynamic(() => import('@/components/Game/GameCanvas'), {
    ssr: false,
});

export default function TagGamePage() {

    const {
        socket
    } = useSocketStore(state => ({
        socket: state.socket
    }));

    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const params = Object.fromEntries(searchParams.entries());
    const { server } = params

    const { controllerState, setControllerState } = useControllerStore()
    const [showControllerState, setShowControllerState] = useState(false)

    // const [ cameraMode, setCameraMode ] = useState('Player')

    const [players, setPlayers] = useState([])

    // PeerJS Refs
    const connectionsRef = useRef({});

    const peer = usePeerStore(state => state.peer)
    const setPeer = usePeerStore(state => state.setPeer)
    const isHost = usePeerStore(state => state.isHost)
    const setIsHost = usePeerStore(state => state.setIsHost)
    const gameState = usePeerStore(state => state.gameState)
    const setGameState = usePeerStore(state => state.setGameState)

    useEffect(() => {

        if (!server && !peer) {
            const initHost = async () => {
                const { default: Peer } = await import('peerjs');
                // Generate 4 character random ID
                const id = Math.random().toString(36).substring(2, 6).toUpperCase();
                const newPeer = new Peer(id);

                newPeer.on('open', (id) => {
                    console.log('Host ID: ' + id);
                    if (!peer) { // Double check to avoid race conditions
                        setPeer(newPeer);
                        setIsHost(true);
                    }
                });

                newPeer.on('connection', (conn) => {
                    conn.on('open', () => {
                        console.log('Client connected: ' + conn.peer);
                        connectionsRef.current[conn.peer] = conn;
                    });
                    conn.on('data', (data) => {
                        if (data.type === 'position') {
                            setGameState(prev => {
                                const players = [...(prev.players || [])];
                                const index = players.findIndex(p => p.id === conn.peer);
                                if (index > -1) {
                                    players[index] = { ...players[index], position: data.position };
                                } else {
                                    players.push({ id: conn.peer, position: data.position });
                                }
                                return { ...prev, players };
                            });
                        }
                    });
                    conn.on('close', () => {
                        console.log('Client disconnected: ' + conn.peer);
                        delete connectionsRef.current[conn.peer];
                        setGameState(prev => ({
                            ...prev,
                            players: (prev.players || []).filter(p => p.id !== conn.peer)
                        }));
                    });
                });

                newPeer.on('error', (err) => {
                    console.error('PeerJS Host error:', err);
                });
            };
            initHost();
        }

        if (server && !peer) {
            const initClient = async () => {
                const { default: Peer } = await import('peerjs');
                const id = Math.random().toString(36).substring(2, 6).toUpperCase();
                const newPeer = new Peer(id);

                newPeer.on('open', (id) => {
                    console.log('Client ID: ' + id);
                    if (!peer) {
                        setPeer(newPeer);
                        setIsHost(false);
                        
                        const conn = newPeer.connect(server);
                        conn.on('open', () => {
                            console.log('Connected to Host');
                            connectionsRef.current['host'] = conn;
                        });
                        conn.on('data', (data) => {
                            if (data.type === 'gameState') {
                                setGameState(data.state);
                            }
                        });
                        conn.on('close', () => console.log('Disconnected from Host'));
                        conn.on('error', err => console.error('Connection Error:', err));
                    }
                });
                
                newPeer.on('error', err => console.error('PeerJS Client Error:', err));
            };
            initClient();
        }

    }, [server, peer, setPeer, setIsHost, setGameState]);

    // Network Loop
    useEffect(() => {
        if (!peer) return;

        const interval = setInterval(() => {
            const myPosition = useTagGameStore.getState().position;
            const myId = peer.id;

            if (isHost) {
                // Host: Update self and broadcast
                const currentState = usePeerStore.getState().gameState;
                const players = [...(currentState.players || [])];
                const index = players.findIndex(p => p.id === myId);
                const newPlayer = { id: myId, position: myPosition };
                
                if (index > -1) {
                    players[index] = newPlayer;
                } else {
                    players.push(newPlayer);
                }
                
                const newState = { ...currentState, players };
                
                setGameState(newState);
                
                // Broadcast
                Object.values(connectionsRef.current).forEach(conn => {
                    if (conn.open) {
                        conn.send({ type: 'gameState', state: newState });
                    }
                });
            } else {
                // Client: Send position to host
                const hostConn = connectionsRef.current['host'];
                if (hostConn && hostConn.open) {
                    hostConn.send({ type: 'position', position: myPosition });
                }
            }
        }, 50);

        return () => clearInterval(interval);
    }, [peer, isHost, setGameState]);
    //     if (server) {
    //         socket.on(`game:tag-room-${server}`, function (msg) {
    //             console.log(`game:tag-room-${server}`, msg)
    //             // setPlayers(msg.players)
    //             // setLobbyDetails(msg)
    //         });
    //     }

    //     return function cleanup() {
    //         socket.emit('leave-room', `game:tag-game-room-${server}`)
    //     };

    // }, []);

    const [showMenu, setShowMenu] = useState(false)

    const [touchControlsEnabled, setTouchControlsEnabled] = useLocalStorageNew("game:touchControlsEnabled", false)

    const [sceneKey, setSceneKey] = useState(0);

    // const [gameState, setGameState] = useState(false)

    // Function to handle scene reload
    const reloadScene = () => {
        setSceneKey((prevKey) => prevKey + 1);
    };

    const { reload } = useKeyboard()
    useEffect(() => {
        if (reload) {
            reloadScene();
        }
    }, [reload])

    const { isFullscreen, requestFullscreen, exitFullscreen } = useFullscreen();

    let panelProps = {
        server,
        players,
        touchControlsEnabled,
        setTouchControlsEnabled,
        reloadScene,
        // controllerState,
        isFullscreen,
        requestFullscreen,
        exitFullscreen,
        setShowMenu
    }

    const game_name = 'Tag'
    const game_key = 'tag'

    return (

        <div
            className={`tag-game-page ${isFullscreen && 'fullscreen'}`}
            id="tag-game-page"
        >

            <div className="menu-bar card card-articles p-1 justify-content-center">

                <div className='flex-header align-items-center'>

                    <ArticlesButton
                        small
                        active={showMenu}
                        onClick={() => {
                            setShowMenu(prev => !prev)
                        }}
                    >
                        <i className="fad fa-bars"></i>
                        <span>Menu</span>
                    </ArticlesButton>

                    <div>
                        {/* Y: {(playerLocation?.y || 0)} */}
                    </div>

                </div>

            </div>

            <div className={`mobile-menu ${showMenu && 'show'}`}>
                <LeftPanelContent
                    {...panelProps}
                />
            </div>

            {/* <TouchControls
                touchControlsEnabled={touchControlsEnabled}
            /> */}

            <div className='panel-left card rounded-0 d-none d-lg-flex'>

                <LeftPanelContent
                    {...panelProps}
                />

            </div>

            {/* <div className='game-info'>
                <div className="card card-articles card-sm">
                    <div className="card-body">
                        <pre> 
                            {JSON.stringify(playerData, undefined, 2)}
                        </pre>
                    </div>
                </div>
            </div> */}

            <div className='canvas-wrap'>

                <SprintMeter />

                <GameCanvas
                    key={sceneKey}
                    gameState={gameState}
                    // playerData={playerData}
                    // setPlayerData={setPlayerData}
                    players={players}
                />

            </div>

        </div>
    );
}