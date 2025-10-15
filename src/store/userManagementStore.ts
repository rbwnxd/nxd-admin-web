import { create } from "zustand";

// 사용자 타입 정의
export interface UserImage {
  name: string;
  imageOriginalPath: string;
  image64Path: string;
  image128Path: string;
  image256Path: string;
  image512Path: string;
  image1024Path: string;
  imageFilename: string;
}

export interface UserProfile {
  name: string;
  nickname: string;
  birth: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  phoneNumber: string;
}

export interface UserPoint {
  currentPoint: number;
  totalUsedPoint: number;
  totalReceivedPoint: number;
}

export interface RestrictionInfo {
  isRestricted: boolean;
  restrictedAt: string | null;
  restrictedReason: string | null;
  restrictionEndsAt: string | null;
}

export interface BanInfo {
  isBanned: boolean;
  bannedReason: string | null;
  bannedAt: string | null;
}

export interface AdminUser {
  _id: string;
  account: string;
  email: string;
  emailVerifiedAt: string | null;
  platform: "GOOGLE" | "APPLE" | "KAKAO" | "NAVER";
  platformUserId: string;
  profile: UserProfile;
  countryCode: string;
  languageCode: string;
  point: UserPoint;
  termsAgreedAt: string;
  nicknameChangedAt: string | null;
  imageList: UserImage[];
  restrictionInfo: RestrictionInfo;
  banInfo: BanInfo;
  memberHash: string;
  favoriteArtistIds: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface UserManagementState {
  users: AdminUser[];
  totalCount: number;
  loading: boolean;
  currentPage: number;
  itemsPerPage: number;
  searchNickname: string;
  
  // Actions
  setUsers: (users: AdminUser[]) => void;
  setTotalCount: (count: number) => void;
  setLoading: (loading: boolean) => void;
  setCurrentPage: (page: number) => void;
  setSearchNickname: (nickname: string) => void;
  findUserById: (id: string) => AdminUser | null;
}

export const useUserManagementStore = create<UserManagementState>((set, get) => ({
  users: [],
  totalCount: 0,
  loading: false,
  currentPage: 1,
  itemsPerPage: 10,
  searchNickname: "",

  setUsers: (users) => set({ users }),
  setTotalCount: (totalCount) => set({ totalCount }),
  setLoading: (loading) => set({ loading }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  setSearchNickname: (searchNickname) => set({ searchNickname }),

  findUserById: (id) => {
    const { users } = get();
    return users.find((user) => user._id === id) || null;
  },
}));
