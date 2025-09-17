import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { axiosApiAuth } from "@/lib/axios";

interface User {
  id: string;
  username: string;
  email?: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
}

interface AuthActions {
  login: (credentials: { account: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // 초기 상태
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      hasHydrated: false,

      // 로그인
      login: async (credentials) => {
        try {
          set({ isLoading: true });
          const response = await axiosApiAuth(
            "/admin/web/signIn",
            "POST",
            credentials
          );

          const { webAdminUser, jsonWebToken } = response.data.data;

          // localStorage에 토큰 저장 (axios 인터셉터에서 사용)
          localStorage.setItem("auth-token", jsonWebToken);

          set({
            user: webAdminUser,
            token: jsonWebToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // 로그아웃
      logout: async () => {
        localStorage.removeItem("auth-token");
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      // 인증 상태 확인 (페이지 로드시)
      checkAuth: async () => {
        const { token, user } = get();

        if (!token || !user) {
          console.log("ws", token, user);
          set({ isAuthenticated: false });
          return;
        }
      },
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),

      // 로딩 상태 설정
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "auth-storage", // localStorage 키
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // Storage 로딩 완료 시 hasHydrated를 true로 설정
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);
