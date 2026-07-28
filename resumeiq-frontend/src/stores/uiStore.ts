import { create } from "zustand";

interface UiState {
  isSidebarOpen: boolean;
  isCommandPaletteOpen: boolean;
  toggleSidebar: () => void;
  toggleCommandPalette: () => void;
}

/** Global, ephemeral UI state — not persisted on purpose. */
export const useUiStore = create<UiState>((set) => ({
  isSidebarOpen: true,
  isCommandPaletteOpen: false,
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  toggleCommandPalette: () =>
    set((s) => ({ isCommandPaletteOpen: !s.isCommandPaletteOpen })),
}));
