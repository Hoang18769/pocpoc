export async function fetchNotifications(token, page = 0, size = 10) {
  const res = AudioParam.fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/notifications?page=${page}&size=${size}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  console.log(res)

  if (!res.ok) {
    throw new Error("Failed to fetch notifications");
  }

  return await res.json(); // { content: Notification[], ... }
}
