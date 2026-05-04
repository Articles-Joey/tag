"use client"
import { createWithEqualityFn as create } from 'zustand/traditional'

export const usePeerStore = create((set, get) => ({

    isHost: false,
    setIsHost: (newValue) => {
        set(() => ({ isHost: newValue }))
    },

    peer: null,
    setPeer: (newValue) => {
        set(() => ({ peer: newValue }))
    },

    currentMap: 'Forest',
    setCurrentMap: (newValue) => {
        set(() => ({ currentMap: newValue }))
    },

    connections: {},
    setConnection: (id, conn) => set(state => ({
        connections: { ...state.connections, [id]: conn }
    })),
    removeConnection: (id) => set(state => {
        const next = { ...state.connections };
        delete next[id];
        return { connections: next };
    }),

    gameState: {
        players: []
    },
    setGameState: (newValue) => {
        set((state) => ({
            gameState: typeof newValue === 'function' ? newValue(state.gameState) : newValue
        }))
    },

    bannedIds: [],
    addBannedId: (id) => set((state) => ({ bannedIds: [...state.bannedIds, id] })),

    displayId: null,
    setDisplayId: (newValue) => {
        set(() => ({ displayId: newValue }))
    },

    kickPlayer: (id) => {
        const { isHost, connections, addBannedId, removeConnection } = get();
        if (!isHost) return;
        const conn = connections[id];
        if (conn) {
            conn.send({ type: 'kicked' });
            addBannedId(id);
            setTimeout(() => {
                conn.close();
                removeConnection(id);
            }, 500);
        }
    },

    handleMapChange: (mapId) => {
        const { isHost, connections, setCurrentMap } = get();
        setCurrentMap(mapId);
        // Lazy import to avoid circular dependency
        const { useStore } = require('@/hooks/useStore');
        useStore.getState().reloadScene();
        if (isHost) {
            Object.values(connections).forEach(conn => {
                if (conn.open) {
                    conn.send({ type: 'mapChange', map: mapId });
                }
            });
        }
    },

    reset: () => set({
        isHost: false,
        peer: null,
        currentMap: 'Forest',
        gameState: { players: [] },
        bannedIds: [],
        displayId: null,
        connections: {},
    })

}))