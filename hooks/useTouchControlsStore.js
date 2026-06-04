// import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createWithEqualityFn as create } from 'zustand/traditional'

const useTouchControlsStore = create()(
    persist(
        (set, get) => ({

            enabled: false,
            setEnabled: (newValue) => {
                set((prev) => ({
                    enabled: newValue
                }))
            },

            touchControls: {
                jump: false,
                sprint: false,
                cameraView: false,
                left: false,
                right: false,
                up: false,
                down: false,
                moveX: 0,
                moveY: 0,
                lookX: 0,
                lookY: 0,
            },
            setTouchControls: (newValue) => {
                set((prev) => ({
                    touchControls: typeof newValue === 'function'
                        ? newValue(prev.touchControls)
                        : newValue
                }))
            }

        }),
        {
            name: 'touch-controls-store',
            version: 1,
            partialize: (state) => ({
                enabled: state.enabled,
                // touchControls: state.touchControls
            }),
            // onRehydrateStorage: () => (state) => {
            //     state.setHasHydrated(true)
            // },
        },
    ),
)

export default useTouchControlsStore