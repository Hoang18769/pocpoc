async authorize(credentials) {
  try {
    const res = await api.post("/v1/auth/login", credentials);
    const data = res.data;

    if (res.status === 200 && data.body) {
      return {
        id: data.body.userId,
        name: data.body.userName,
        accessToken: data.body.token,
      };
    }
    return null;
  } catch (error) {
    console.error("Login failed:", error);
    return null;
  }
}
