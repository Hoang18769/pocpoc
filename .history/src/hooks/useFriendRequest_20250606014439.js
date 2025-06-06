export default function useFriendRequestStatus(username, options = {}) {
  const [status, setStatus] = useState("idle");
  const [friendId, setFriendId] = useState(null);
  const { onReceivedRequestId, disabled = false } = options;

  useEffect(() => {
    if (!username || disabled) return;

    const fetchStatus = async () => {
      try {
        const [sentRes, receivedRes, friendsRes] = await Promise.all([
          api.get("/v1/friend-request/sent-requests"),
          api.get("/v1/friend-request/received-requests"),
          api.get("/v1/friends"),
        ]);

        const sent = sentRes.data.body;
        const received = receivedRes.data.body;
        const friends = friendsRes.data.body;

        const friend = friends.find((f) => f.username === username);
        if (friend) {
          setStatus("friend");
          setFriendId(friend.uuid); // ⬅️ Lưu lại UUID để xoá
          return;
        }

        const sentReq = sent.find((r) => r.user.username === username);
        if (sentReq) {
          setStatus("sent");
          return;
        }

        const receivedReq = received.find((r) => r.user.username === username);
        if (receivedReq) {
          setStatus("received");
          onReceivedRequestId?.(receivedReq.requestId);
          return;
        }

        setStatus("none");
      } catch (err) {
        console.error("❌ Lỗi khi kiểm tra trạng thái kết bạn:", err);
        setStatus("none");
      }
    };

    fetchStatus();
  }, [username, disabled, onReceivedRequestId]);

  return [status, setStatus, friendId]; 
}
