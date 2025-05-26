export default function PostCardResponsive({ 
  post, 
  size = "default",
  className = "",
  variant = "default" // ← thêm variant
}) {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640)
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024)
    }
    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  const demoPost = {
    user: {
      name: "Jane Doe",
      avatar: avt,
    },
    time: "2 hours ago",
    content: "This is a sample post content to demonstrate the UI layout.",
    likes: 128,
    image: "/demo-photo.jpg", // bạn có thể đổi thành ảnh từ public folder
    latestComment: {
      user: "johnny123",
      content: "Looks awesome!",
    },
    totalComments: 42,
  }

  const finalPost = variant === "demo" ? demoPost : post
  ...
