import { create } from "zustand";
import { Mission } from "@/lib/types";

interface MissionState {
  missions: Mission[];
  totalCount: number;
  loading: boolean;
  currentPage: number;
  itemsPerPage: number;

  // Actions
  setMissions: (missions: Mission[]) => void;
  setTotalCount: (count: number) => void;
  setLoading: (loading: boolean) => void;
  setCurrentPage: (page: number) => void;
  removeMission: (id: string) => void;
  resetPagination: () => void;
  reset: () => void;
}

export const useMissionStore = create<MissionState>((set) => ({
  missions: [],
  totalCount: 0,
  loading: false,
  currentPage: 1,
  itemsPerPage: 10,

  setMissions: (missions) => set({ missions }),
  setTotalCount: (totalCount) => set({ totalCount }),
  setLoading: (loading) => set({ loading }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  removeMission: (id) =>
    set((state) => ({
      missions: state.missions.filter((m) => m._id !== id),
      totalCount: state.totalCount - 1,
    })),
  resetPagination: () => set({ currentPage: 1 }),
  reset: () =>
    set({
      missions: [],
      totalCount: 0,
      loading: false,
      currentPage: 1,
    }),
}));
