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
import { useStore } from '@/hooks/useStore';
import classNames from 'classnames';

const GameCanvas = dynamic(() => import('@/components/Game/GameCanvas'), {
    ssr: false,
});

export default function TagGamePage() {

    // const {
    //     socket
    // } = useSocketStore(state => ({
    //     socket: state.socket
    // }));

    // Global User Settings
    const nickname = useStore(state => state.nickname);
    const sidebar = useStore(state => state.sidebar);

    const showMenu = useStore(state => state.showMenu);
    const toggleShowMenu = useStore(state => state.toggleShowMenu);
    // const setShowMenu = useStore(state => state.setShowMenu);

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
    const addBannedId = usePeerStore(state => state.addBannedId)

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

                    if (usePeerStore.getState().bannedIds.includes(conn.peer)) {
                        console.log('Rejected banned peer:', conn.peer);
                        conn.close();
                        return;
                    }

                    conn.on('open', () => {
                        console.log('Client connected: ' + conn.peer);
                        connectionsRef.current[conn.peer] = conn;
                    });
                    conn.on('data', (msg) => {
                        if (msg.type === 'playerUpdate') {
                            setGameState(prev => {
                                const players = [...(prev.players || [])];
                                const index = players.findIndex(p => p.id === conn.peer);
                                const newPlayerData = {
                                    id: conn.peer,
                                    ...msg.data
                                };

                                if (index > -1) {
                                    players[index] = { ...players[index], ...newPlayerData };
                                } else {
                                    players.push(newPlayerData);
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
                            if (data.type === 'kicked') {
                                console.log('You have been kicked by the host.');
                                conn.close();
                                router.push('/');
                                return;
                            }
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

    const lastTagTime = useRef(0);

    // Network Loop
    useEffect(() => {
        if (!peer) return;

        const interval = setInterval(() => {
            const { position: myPosition, rotation: myRotation, action: myAction } = useTagGameStore.getState();
            // Get nickname directly to ensure freshness inside interval
            const myNickname = useStore.getState().nickname;
            const myId = peer.id;

            if (isHost) {
                // Host: Update self and broadcast
                const currentState = usePeerStore.getState().gameState;
                let players = [...(currentState.players || [])];
                const index = players.findIndex(p => p.id === myId);
                const newPlayer = { id: myId, position: myPosition, rotation: myRotation, action: myAction, nickname: myNickname };

                if (index > -1) {
                    players[index] = newPlayer;
                } else {
                    players.push(newPlayer);
                }

                let itPlayerId = currentState.itPlayerId || myId; // Default to host if not set

                // Debug distance when I am not IT
                if (itPlayerId !== myId) {
                    const itPlayer = players.find(p => p.id === itPlayerId);
                    const me = players.find(p => p.id === myId);
                    if (itPlayer && me && itPlayer.position && me.position) {
                        const dx = me.position[0] - itPlayer.position[0];
                        const dy = me.position[1] - itPlayer.position[1];
                        const dz = me.position[2] - itPlayer.position[2];
                        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                        // console.log(`Distance to IT (${itPlayerId}): ${dist.toFixed(2)}`);
                    }
                }

                // Tag Logic
                if (Date.now() > lastTagTime.current + 3000) {
                    const currentItPlayer = players.find(p => p.id === itPlayerId);

                    if (currentItPlayer && currentItPlayer.position) {
                        // Check collisions with other players
                        // Use find to only trigger one tag per tick and avoid loop mutation issues
                        const taggedPlayer = players.find(p => {
                            if (p.id === itPlayerId) return false; // Don't tag self
                            if (!p.position) return false;

                            const dx = p.position[0] - currentItPlayer.position[0];
                            const dy = p.position[1] - currentItPlayer.position[1];
                            const dz = p.position[2] - currentItPlayer.position[2];
                            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                            return dist < 1.0;
                        });

                        if (taggedPlayer) {
                            console.log(`Tag Event! ${itPlayerId} tagged ${taggedPlayer.id}`);
                            itPlayerId = taggedPlayer.id;
                            lastTagTime.current = Date.now();
                        }

                    } else {
                        // If IT player left or is invalid, reset to Host
                        if (!currentItPlayer && players.length > 0) {
                            console.log("IT player lost, resetting to Host");
                            itPlayerId = myId;
                        }
                    }
                }

                const newState = { ...currentState, players, itPlayerId };

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
                    hostConn.send({
                        type: 'playerUpdate',
                        data: { position: myPosition, rotation: myRotation, action: myAction, nickname: myNickname }
                    });
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

    // const [showMenu, setShowMenu] = useState(false)

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

    const kickPlayer = (id) => {
        if (!isHost) return;
        const conn = connectionsRef.current[id];
        if (conn) {
            conn.send({ type: 'kicked' });
            addBannedId(id);
            setTimeout(() => {
                conn.close();
            }, 500);
        }
    };

    let panelProps = {
        kickPlayer,
        // server,
        players,
        touchControlsEnabled,
        setTouchControlsEnabled,
        reloadScene,
        // controllerState,
        // isFullscreen,
        // requestFullscreen,
        // exitFullscreen,
        // setShowMenu
    }

    const game_name = 'Tag'
    const game_key = 'tag'

    return (

        <div
            className={
                classNames(
                    `tag-game-page`,
                    isFullscreen && 'fullscreen',
                    sidebar && 'sidebar-open'
                )
            }
            id="tag-game-page"
        >

            <div className="menu-bar card rounded-0 card-articles p-1 justify-content-center">

                <div className='flex-header align-items-center'>

                    <ArticlesButton
                        small
                        active={showMenu}
                        onClick={() => {
                            toggleShowMenu()
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
                <div
                    style={{
                        maxWidth: '300px',
                        margin: '0 auto'
                    }}
                >
                    <LeftPanelContent
                        {...panelProps}
                    />
                </div>
            </div>

            {/* <TouchControls
                touchControlsEnabled={touchControlsEnabled}
            /> */}

            <div className='panel-left'>

                {/* <div className='card rounded-0'> */}
                <LeftPanelContent
                    {...panelProps}
                />
                {/* </div> */}

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