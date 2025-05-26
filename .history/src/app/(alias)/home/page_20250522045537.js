async redirects() {
    return [
      {
        source: '/home',
        destination: '/main/home',
        permanent: false, // true nếu bạn muốn SEO redirect vĩnh viễn (301)
      },
    ]
  },