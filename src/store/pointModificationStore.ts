import { create } from "zustand";
import { PointModification } from "@/lib/types";

interface PointModificationState {
  pointModifications: PointModification[];
  totalCount: number;
  loading: boolean;
  currentPage: number;
  itemsPerPage: number;
  selectedType: "GRANT" | "REVOKE";
  searchTitle: string;

  // Actions
  setPointModifications: (pointModifications: PointModification[]) => void;
  setTotalCount: (count: number) => void;
  setLoading: (loading: boolean) => void;
  setCurrentPage: (page: number) => void;
  setSelectedType: (type: "GRANT" | "REVOKE") => void;
  setSearchTitle: (title: string) => void;
  addPointModification: (pointModification: PointModification) => void;
  findPointModificationById: (id: string) => PointModification | null;
}

export const usePointModificationStore = create<PointModificationState>(
  (set, get) => ({
    pointModifications: [],
    totalCount: 0,
    loading: false,
    currentPage: 1,
    itemsPerPage: 10,
    selectedType: "GRANT",
    searchTitle: "",

    setPointModifications: (pointModifications) => set({ pointModifications }),
    setTotalCount: (totalCount) => set({ totalCount }),
    setLoading: (loading) => set({ loading }),
    setCurrentPage: (currentPage) => set({ currentPage }),
    setSelectedType: (selectedType) => set({ selectedType }),
    setSearchTitle: (searchTitle) => set({ searchTitle }),

    addPointModification: (pointModification) => {
      set((state) => ({
        pointModifications: [pointModification, ...state.pointModifications],
        totalCount: state.totalCount + 1,
      }));
    },

    findPointModificationById: (id) => {
      const { pointModifications } = get();
      return pointModifications.find((pm) => pm._id === id) || null;
    },
  })
);
