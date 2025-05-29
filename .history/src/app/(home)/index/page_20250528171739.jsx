const postSample = {
  user: {
    name: "Jane Doe",
    avatar: avt.src,
  },
  time: "2 hours ago",
  content: "Exploring the mountains today! 🏔️ The view is breathtaking and I feel so alive.",
  image: avt.src, // ✅ Fix: dùng avt.src
  likes: 132,
  latestComment: {
    user: "johnsmith",
    content: "Wow! Looks amazing 😍",
  },
  totalComments: 24,
}
