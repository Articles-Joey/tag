"use client"
import { createWithEqualityFn as create } from 'zustand/traditional'

export const usePeerStore = create((set) => ({

    isHost: false,
    setIsHost: (newValue) => {
        set((prev) => ({
            isHost: newValue
        }))
    },

    peer: null,
    setPeer: (newValue) => {
        set((prev) => ({
            peer: newValue
        }))
    },

    gameState: {
        players: []
    },
    setGameState: (newValue) => {
        set((state) => ({
            gameState: typeof newValue === 'function' ? newValue(state.gameState) : newValue
        }))
    },
    
}))