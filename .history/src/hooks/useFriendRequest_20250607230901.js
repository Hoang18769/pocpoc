const useFriendRequestStatus = (targetUsername, { onReceivedRequestId, disabled }) => {
  const [status, setStatus] = useState("none");
  const [requestId, setRequestId] = useState(null);
  const [friendId, setFriendId] = useState(null);

  useEffect(() => {
    if (disabled || !targetUsername) return;

    const fetchStatus = async () => {
      try {
        // Kiểm tra lời mời đã nhận
        const receivedRes = await api.get("/v1/friend-request/received-requests");
        const received = receivedRes.data.body.find(
          r => r.user.username === targetUsername
        );
        if (received) {
          setStatus("received");
          setRequestId(received.requestId);
          onReceivedRequestId?.(received.requestId);
          return;
        }

        // Kiểm tra lời mời đã gửi
        const sentRes = await api.get("/v1/friend-request/sent-requests");
        const sent = sentRes.data.body.find(
          r => r.user.username === targetUsername
        );
        if (sent) {
          setStatus("sent");
          setRequestId(sent.requestId);
          return;
        }

        // TODO: Kiểm tra nếu là bạn bè (gọi API `/v1/friends` nếu có)
        // setStatus("friend");
        // setFriendId(friend.id);

        setStatus("none");
      } catch (err) {
        console.error("Failed to fetch friend request status", err);
      }
    };

    fetchStatus();
  }, [targetUsername, disabled]);

  return [status, setStatus, requestId, friendId];
};
