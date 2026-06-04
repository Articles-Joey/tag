"use client"
import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { usePeerStore } from '@/hooks/usePeerStore';
import { useTagGameStore } from '@/hooks/useTagGameStore';
import { useStore } from '@/hooks/useStore';

export default function PeerLogicHandler() {

    const router = useRouter();
    const searchParams = useSearchParams();
    const server = searchParams.get('server');

    const peer = usePeerStore(state => state.peer);
    const setPeer = usePeerStore(state => state.setPeer);
    const isHost = usePeerStore(state => state.isHost);
    const setIsHost = usePeerStore(state => state.setIsHost);
    const setGameState = usePeerStore(state => state.setGameState);
    const addBannedId = usePeerStore(state => state.addBannedId);
    const setDisplayId = usePeerStore(state => state.setDisplayId);
    const setCurrentMap = usePeerStore(state => state.setCurrentMap);
    const setConnection = usePeerStore(state => state.setConnection);
    const removeConnection = usePeerStore(state => state.removeConnection);

    const reloadScene = useStore(state => state.reloadScene);

    const initializingRef = useRef(false);
    const lastTagTime = useRef(0);

    // Peer Initialization
    useEffect(() => {

        if (!server && !peer && !initializingRef.current) {
            initializingRef.current = true;
            const initHost = async () => {
                const { default: Peer } = await import('peerjs');
                const id = Math.random().toString(36).substring(2, 6).toUpperCase();
                const newPeer = new Peer(id);

                newPeer.on('open', (id) => {
                    console.log('Host ID: ' + id);
                    if (!usePeerStore.getState().peer) {
                        setPeer(newPeer);
                        setIsHost(true);
                        setDisplayId(id);
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
                        setConnection(conn.peer, conn);
                        reloadScene();

                        // Tell all existing clients to reload their scene too
                        Object.values(usePeerStore.getState().connections).forEach(c => {
                            if (c.open) {
                                c.send({ type: 'reloadScene' });
                            }
                        });
                    });

                    conn.on('data', (msg) => {
                        if (msg.type === 'playerUpdate') {
                            setGameState(prev => {
                                const players = [...(prev.players || [])];
                                const index = players.findIndex(p => p.id === conn.peer);
                                const newPlayerData = { id: conn.peer, ...msg.data };

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
                        removeConnection(conn.peer);
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

        if (server && !peer && !initializingRef.current) {
            initializingRef.current = true;
            const initClient = async () => {
                const { default: Peer } = await import('peerjs');
                const id = Math.random().toString(36).substring(2, 6).toUpperCase();
                const newPeer = new Peer(id);

                newPeer.on('open', (id) => {
                    console.log('Client ID: ' + id);
                    if (!usePeerStore.getState().peer) {
                        setPeer(newPeer);
                        setIsHost(false);
                        setDisplayId(server);

                        const conn = newPeer.connect(server);
                        conn.on('open', () => {
                            console.log('Connected to Host');
                            setConnection('host', conn);
                        });
                        conn.on('data', (data) => {
                            if (data.type === 'kicked') {
                                console.log('You have been kicked by the host.');
                                conn.close();
                                router.push('/');
                                return;
                            }
                            if (data.type === 'reloadScene') {
                                console.log('Host requested scene reload (new player joined)');
                                reloadScene();
                                return;
                            }
                            if (data.type === 'mapChange') {
                                console.log('Host changed map to:', data.map);
                                setCurrentMap(data.map);
                                reloadScene();
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

    // Network Loop
    useEffect(() => {
        if (!peer) return;

        const interval = setInterval(() => {
            const { position: myPosition, rotation: myRotation, action: myAction } = useTagGameStore.getState();
            const myNickname = useStore.getState().nickname;
            const myId = peer.id;

            if (isHost) {
                let broadcastState = null;

                setGameState(prev => {
                    const players = [...(prev.players || [])];
                    let itPlayerId = prev.itPlayerId || myId;

                    // 1. Update Host Data
                    const index = players.findIndex(p => p.id === myId);
                    const newPlayer = { id: myId, position: myPosition, rotation: myRotation, action: myAction, nickname: myNickname };

                    if (index > -1) {
                        players[index] = { ...players[index], ...newPlayer };
                    } else {
                        players.push(newPlayer);
                    }

                    // 2. Tag Logic
                    if (Date.now() > lastTagTime.current + 3000) {
                        const currentItPlayer = players.find(p => p.id === itPlayerId);

                        if (currentItPlayer && currentItPlayer.position) {
                            const taggedPlayer = players.find(p => {
                                if (p.id === itPlayerId) return false;
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
                            if (!currentItPlayer && players.length > 0) {
                                console.log("IT player lost, resetting to Host");
                                itPlayerId = myId;
                            }
                        }
                    }

                    // 3. Construct New State
                    const newState = { ...prev, players, itPlayerId };
                    broadcastState = newState;
                    return newState;
                });

                // Broadcast the state we just calculated
                if (broadcastState) {
                    Object.values(usePeerStore.getState().connections).forEach(conn => {
                        if (conn.open) {
                            conn.send({ type: 'gameState', state: broadcastState });
                        }
                    });
                }

            } else {
                // Client: Send position to host
                const hostConn = usePeerStore.getState().connections['host'];
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

    return null;
}
