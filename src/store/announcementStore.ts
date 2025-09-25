import { create } from "zustand";
import { Announcement } from "@/lib/types";
import { createJSONStorage, persist } from "zustand/middleware";

interface AnnouncementState {
  announcements: Announcement[];
  currentPage: number;
  totalCount: number;
}

interface AnnouncementActions {
  setAnnouncements: (announcements: Announcement[]) => void;
  setCurrentPage: (page: number) => void;
  setTotalCount: (count: number) => void;
  resetPagination: () => void;
}

type AnnouncementStore = AnnouncementState & AnnouncementActions;

export const useAnnouncementStore = create<AnnouncementStore>()(
  persist(
    (set, get) => ({
      announcements: [],
      currentPage: 1,
      totalCount: 0,
      setAnnouncements: (announcements: Announcement[]) => {
        set({ announcements });
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
      name: "announcement-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        announcements: state.announcements,
        currentPage: state.currentPage,
        totalCount: state.totalCount,
      }),
    }
  )
);
