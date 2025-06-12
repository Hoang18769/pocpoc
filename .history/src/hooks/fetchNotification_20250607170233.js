import api from "@/utils/axios";

export async function fetchNotifications(token, page = 0, size = 10) {
  try {
    const res = await api.get(`/v1/notifications`, {
      params: { page, size },
      // headers: {
      //   Authorization: `Bearer ${token}`,
      // },
    });
    console.log(res)

    return res.data; // dữ liệu từ backend, thường là { content: [...], ... }
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    throw new Error("Failed to fetch notifications");
  }
}
