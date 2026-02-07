import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useStore = create()(
  persist(
    (set, get) => ({

      _hasHydrated: false,
      setHasHydrated: (state) => {
        set({
          _hasHydrated: state
        });
      },

      nickname: "",
      setNickname: (newValue) => set({ nickname: newValue }),

      darkMode: null,
      setDarkMode: (newValue) => set({ darkMode: newValue }),
      toggleDarkMode: () => set({ darkMode: !get().darkMode }),

      sidebar: false,
      setSidebar: (value) => set({ sidebar: value }),
      toggleSidebar: () => set({ sidebar: !get().sidebar }),

      showCreditsModal: false,
      setShowCreditsModal: (value) => set({ showCreditsModal: value }),

      showInfoModal: false,
      setShowInfoModal: (value) => set({ showInfoModal: value }),

      showSettingsModal: false,
      setShowSettingsModal: (value) => set({ showSettingsModal: value }),

      showInviteModal: false,
      setShowInviteModal: (value) => set({ showInviteModal: value }),

      graphicsQuality: "High",
      setGraphicsQuality: (value) => set({ graphicsQuality: value }),

    }),
    {
      name: 'tag-game-storage', // name of the item in the storage (must be unique)
      // storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
      onRehydrateStorage: () => (state) => {
        state.setHasHydrated(true)
      },
      partialize: (state) => ({

        darkMode: state.darkMode,
        // theme: state.theme,
        nickname: state.nickname,

        // renderMode: state.renderMode,

        // touchControlsEnabled: state.touchControlsEnabled,
        // cameraShakeEnabled: state.cameraShakeEnabled,

        // debug: state.debug,
        // devDebugPanel: state.devDebugPanel,
        // debugTab: state.debugTab,
      }),
    },
  ),
)