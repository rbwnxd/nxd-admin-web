"use server";

import { axiosApi } from "@/lib/axios";

// 관리자용 사용자 목록 조회
export const getUsers = async ({
  params,
  jsonWebToken,
}: {
  params?: {
    nickname?: string;
    __skip?: number;
    __limit?: number;
  };
  jsonWebToken: string;
}) => {
  try {
    const { data } = await axiosApi("/admin/users", "get", params, {
      headers: {
        Authorization: `jwt ${jsonWebToken}`,
      },
    });
    return (data && data["data"]) || null;
  } catch (error) {
    console.warn("getUsers error", error);
    throw error;
  }
};

// 관리자용 사용자 상세 조회
export const getUserDetail = async ({
  userId,
  jsonWebToken,
}: {
  userId: string;
  jsonWebToken: string;
}) => {
  try {
    const { data } = await axiosApi(
      `/admin/users/${userId}`,
      "get",
      undefined,
      {
        headers: {
          Authorization: `jwt ${jsonWebToken}`,
        },
      }
    );
    return (data && data["data"]) || null;
  } catch (error) {
    console.warn("getUserDetail error", error);
    throw error;
  }
};
