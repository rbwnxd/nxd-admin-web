import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { Popup } from "@/lib/types";

interface PopupState {
  popups: Popup[];
  currentPage: number;
  totalCount: number;
  includeDeleted: boolean;
  includeUnpublished: boolean;
}

interface PopupActions {
  setPopups: (popups: Popup[]) => void;
  setCurrentPage: (page: number) => void;
  setTotalCount: (count: number) => void;
  setIncludeDeleted: (includeDeleted: boolean) => void;
  setIncludeUnpublished: (includeUnpublished: boolean) => void;
  resetPagination: () => void;
}

type PopupStore = PopupState & PopupActions;

export const usePopupStore = create<PopupStore>()(
  persist(
    (set) => ({
      popups: [],
      currentPage: 1,
      totalCount: 0,
      includeDeleted: false,
      includeUnpublished: true,
      setPopups: (popups) => set({ popups }),
      setCurrentPage: (currentPage) => set({ currentPage }),
      setTotalCount: (totalCount) => set({ totalCount }),
      setIncludeDeleted: (includeDeleted) => set({ includeDeleted }),
      setIncludeUnpublished: (includeUnpublished) =>
        set({ includeUnpublished }),
      resetPagination: () => set({ currentPage: 1, totalCount: 0 }),
    }),
    {
      name: "popup-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        popups: state.popups,
        currentPage: state.currentPage,
        totalCount: state.totalCount,
        includeDeleted: state.includeDeleted,
        includeUnpublished: state.includeUnpublished,
      }),
    },
  ),
);
