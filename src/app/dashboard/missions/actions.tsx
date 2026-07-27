"use server";

import { axiosApi } from "@/lib/axios";
import type { MissionFormData } from "@/lib/types";

// 미션 목록 조회
export const getMissions = async ({
  params,
  jsonWebToken,
}: {
  params?: {
    __skip?: number;
    __limit?: number;
  };
  jsonWebToken: string;
}) => {
  try {
    const { data } = await axiosApi("/admin/missions", "get", params, {
      headers: {
        Authorization: `jwt ${jsonWebToken}`,
      },
    });
    return (data && data["data"]) || null;
  } catch (error) {
    console.warn("Mission getMissions error", error);
    throw error;
  }
};

// 미션 상세 조회
export const getMissionDetail = async ({
  missionId,
  jsonWebToken,
}: {
  missionId: string;
  jsonWebToken: string;
}) => {
  try {
    const { data } = await axiosApi(
      `/admin/missions/${missionId}`,
      "get",
      undefined,
      {
        headers: {
          Authorization: `jwt ${jsonWebToken}`,
        },
      },
    );
    return (data && data["data"]) || null;
  } catch (error) {
    console.warn("Mission getMissionDetail error", error);
    throw error;
  }
};

// 미션 생성
export const createMission = async ({
  body,
  jsonWebToken,
}: {
  body: MissionFormData;
  jsonWebToken: string;
}) => {
  try {
    const { data } = await axiosApi("/admin/missions", "post", body, {
      headers: {
        Authorization: `jwt ${jsonWebToken}`,
      },
    });
    return (data && data["data"] && data["data"]["mission"]) || null;
  } catch (error) {
    console.warn("Mission createMission error", error);
    throw error;
  }
};

// 미션 수정
export const updateMission = async ({
  missionId,
  body,
  jsonWebToken,
}: {
  missionId: string;
  body: MissionFormData;
  jsonWebToken: string;
}) => {
  try {
    const { data } = await axiosApi(
      `/admin/missions/${missionId}`,
      "put",
      body,
      {
        headers: {
          Authorization: `jwt ${jsonWebToken}`,
        },
      },
    );
    return (data && data["data"] && data["data"]["mission"]) || null;
  } catch (error) {
    console.warn("Mission updateMission error", error);
    throw error;
  }
};

// 미션 삭제
export const deleteMission = async ({
  missionId,
  jsonWebToken,
}: {
  missionId: string;
  jsonWebToken: string;
}) => {
  try {
    const { data } = await axiosApi(
      `/admin/missions/${missionId}`,
      "delete",
      undefined,
      {
        headers: {
          Authorization: `jwt ${jsonWebToken}`,
        },
      },
    );
    return data || null;
  } catch (error) {
    console.warn("Mission deleteMission error", error);
    throw error;
  }
};

// 미션 참여 통계 동기화
export const syncMissionParticipationStats = async ({
  body,
  jsonWebToken,
}: {
  body?: { dateKST?: string };
  jsonWebToken: string;
}) => {
  try {
    const { data } = await axiosApi(
      "/admin/missions/participation-stats/sync",
      "post",
      body || {},
      {
        headers: {
          Authorization: `jwt ${jsonWebToken}`,
        },
      },
    );
    return (data && data["data"]) || null;
  } catch (error) {
    console.warn("Mission syncMissionParticipationStats error", error);
    throw error;
  }
};

// 사용자별 미션 참여 요약 동기화
export const syncMissionParticipationSummaries = async ({
  jsonWebToken,
}: {
  jsonWebToken: string;
}) => {
  try {
    const { data } = await axiosApi(
      "/admin/missions/participation-summaries/sync",
      "post",
      {},
      {
        headers: {
          Authorization: `jwt ${jsonWebToken}`,
        },
      },
    );
    return (data && data["data"]) || null;
  } catch (error) {
    console.warn("Mission syncMissionParticipationSummaries error", error);
    throw error;
  }
};
