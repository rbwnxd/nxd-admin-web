import { create } from "zustand";
import { Artist } from "@/lib/types";
import { createJSONStorage, persist } from "zustand/middleware";

interface ArtistState {
  artists: Artist[];
  currentPage: number;
  totalCount: number;
}

interface ArtistActions {
  setArtists: (artists: Artist[]) => void;
  setCurrentPage: (page: number) => void;
  setTotalCount: (count: number) => void;
  resetPagination: () => void;
}

type ArtistStore = ArtistState & ArtistActions;

export const useArtistStore = create<ArtistStore>()(
  persist(
    (set, get) => ({
      artists: [],
      currentPage: 1,
      totalCount: 0,
      setArtists: (artists: Artist[]) => {
        set({ artists });
      },
      setCurrentPage: (page: number) => {
        set({ currentPage: page });
      },
      setTotalCount: (count: number) => {
        set({ totalCount: count });
      },
      resetPagination: () => {
        set({ currentPage: 1, totalCount: 0 });
      },
    }),
    {
      name: "artist-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentPage: state.currentPage,
        totalCount: state.totalCount,
      }),
    }
  )
);
