const [
  friendRequestStatus,
  setFriendRequestStatus,
  requestId,
  friendId
] = useFriendRequestStatus(profileData?.username, {
  onReceivedRequestId: setRequestId,
  disabled: isOwnProfile,
});
