"use server";

import { axiosApi } from "@/lib/axios";

export interface PopupRequestBody {
  eventName: string;
  displayStartedAt: string;
  displayEndedAt: string;
  displayOrder?: number;
  isPublished: boolean;
  image: {
    name: string;
    imageOriginalPath: string;
  };
  externalLink: string | null;
}

export const getPopups = async ({
  params,
  jsonWebToken,
}: {
  params?: {
    __skip?: number;
    __limit?: number;
    __includeDeleted?: boolean;
    __includeUnpublished?: boolean;
  };
  jsonWebToken: string | null;
}) => {
  try {
    const { data } = await axiosApi("/admin/popups", "get", params, {
      headers: {
        Authorization: `jwt ${jsonWebToken}`,
      },
    });
    return (data && data["data"]) || null;
  } catch (error) {
    console.warn("PopupActions getPopups error", error);
    throw error;
  }
};

export const getPopup = async ({
  id,
  jsonWebToken,
}: {
  id: string;
  jsonWebToken: string | null;
}) => {
  try {
    const { data } = await axiosApi(
      `/admin/popups/${id}`,
      "get",
      {},
      {
        headers: {
          Authorization: `jwt ${jsonWebToken}`,
        },
      },
    );
    return (data && data["data"] && data["data"]["popup"]) || null;
  } catch (error) {
    console.warn("PopupActions getPopup error", error);
    throw error;
  }
};

export const postPopup = async ({
  body,
  jsonWebToken,
}: {
  body: PopupRequestBody;
  jsonWebToken: string | null;
}) => {
  try {
    const { data } = await axiosApi("/admin/popups", "post", body, {
      headers: {
        Authorization: `jwt ${jsonWebToken}`,
      },
    });
    return (data && data["data"] && data["data"]["popup"]) || null;
  } catch (error) {
    console.warn("PopupActions postPopup error", error);
    throw error;
  }
};

export const putPopup = async ({
  id,
  body,
  jsonWebToken,
}: {
  id: string;
  body: PopupRequestBody;
  jsonWebToken: string | null;
}) => {
  try {
    const { data } = await axiosApi(`/admin/popups/${id}`, "put", body, {
      headers: {
        Authorization: `jwt ${jsonWebToken}`,
      },
    });
    return (data && data["data"] && data["data"]["popup"]) || null;
  } catch (error) {
    console.warn("PopupActions putPopup error", error);
    throw error;
  }
};

export const deletePopup = async ({
  id,
  jsonWebToken,
}: {
  id: string;
  jsonWebToken: string | null;
}) => {
  try {
    const { data } = await axiosApi(
      `/admin/popups/${id}`,
      "delete",
      {},
      {
        headers: {
          Authorization: `jwt ${jsonWebToken}`,
        },
      },
    );
    return data && !data?.["error"] ? true : false;
  } catch (error) {
    console.warn("PopupActions deletePopup error", error);
    throw error;
  }
};
