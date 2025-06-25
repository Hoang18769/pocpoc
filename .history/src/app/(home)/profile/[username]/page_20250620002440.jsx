"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProfileHeader from "@/components/social-app-component/ProfileHeader";
import api from "@/utils/axios";
import PostCard from "@/components/social-app-component/PostCard";
import usePostActions from "@/hooks/usePostAction";

export default function ProfilePage() {
  const { username: routeUsername } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [files, setFiles] = useState([]);
  const [localUsername, setLocalUsername] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [activeImageIndex, setActiveImageIndex] = useState(null);
  const { toggleLike } = usePostActions({ posts, setPosts });

  useEffect(() => {
    const storedUsername = localStorage.getItem("userName");
    if (storedUsername) {
      setLocalUsername(storedUsername);
      setIsOwnProfile(storedUsername === routeUsername);
    }
  }, [routeUsername]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!routeUsername) return;
      try {
        const res = await api.get(`/v1/users/${routeUsername}`);
        if (res.data.code === 200) {
          setProfileData(res.data.body);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    fetchProfile();
  }, [routeUsername]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!routeUsername) return;
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.warn("Không có token đăng nhập");
        return;
      }

      try {
        const res = await api.get(`/v1/posts/of-user/${routeUsername}`);
        if (res.data.code === 200) {
          setPosts(res.data.body || []);
        }
        console.log(res.data.body)
      } catch (error) {
        console.error("Lỗi khi tải bài viết:", error);
      }
    };

    fetchPosts();
  }, [routeUsername]);

  // Filter posts based on privacy and friendship status
  useEffect(() => {
    if (!posts.length || !profileData) {
      setFilteredPosts([]);
      return;
    }

    const filterPosts = () => {
      // If it's own profile, show all posts
      if (isOwnProfile) {
        return posts;
      }

      // If user is friend, show public and friend posts
      if (profileData.isFriend) {
        return posts.filter(post => 
          post.privacy === 'PUBLIC' || post.privacy === 'FRIEND'
        );
      }

      // If not friend, only show PUBLIC posts
      return posts.filter(post => post.privacy === 'PUBLIC');
    };

    setFilteredPosts(filterPosts());
  }, [posts, profileData, isOwnProfile]);

  useEffect(() => {
    const fetchFiles = async () => {
      if (!routeUsername || activeTab !== "file") return;
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.warn("Không có token đăng nhập");
        return;
      }

      try {
        const res = await api.get(`/v1/posts/files/${routeUsername}`);
        if (res.data.code === 200) {
          const fileUrls = res.data.body || [];
          setFiles(fileUrls);
        }
      } catch (error) {
        console.error("Lỗi khi tải files:", error);
      }
    };

    fetchFiles();
  }, [routeUsername, activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleImageClick = (index) => {
    setActiveImageIndex(index);
    console.log(`Clicked on image at index: ${index}`);
  };

  const handleToggleLike = async (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id !== postId) return post;

        const liked = post.liked;
        const updatedPost = {
          ...post,
          liked: !liked,
          likeCount: post.likeCount + (liked ? -1 : 1),
        };

        (async () => {
          try {
            if (liked) {
              await api.delete(`/v1/posts/unlike/${postId}`);
            } else {
              await api.post(`/v1/posts/like/${postId}`);
            }
          } catch (err) {
            console.error("Toggle like failed:", err);
          }
        })();

        return updatedPost;
      })
    );
  };

  return (
    <main className="max-w-4xl mx-auto mt-4">
      {profileData ? (
        <>
          <ProfileHeader
            profileData={profileData}
            isOwnProfile={isOwnProfile}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onProfileUpdate={(updatedData) =>
              setProfileData((prev) => ({ ...prev, ...updatedData }))
            }
          />

          <section className="mt-6 space-y-4">
            {activeTab === "posts" ? (
              filteredPosts.length > 0 ? (
                filteredPosts
                  .slice()
                  .map((post) => (
                    <PostCard
                      key={post.id || Math.random().toString(36)}
                      post={post}
                      liked={post.liked}
                      likeCount={post.likeCount}
                      onLikeToggle={() => toggleLike(post.id)}
                      isOwnProfile={isOwnProfile}
                      isFriend={profileData?.isFriend}
                    />
                  ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  {isOwnProfile ? "Chưa có bài viết nào." : "Không có bài viết nào để hiển thị."}
                </p>
              )
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                {files.length > 0 ? (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                      File phương tiện ({files.length})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {files.map((url, index) => {
                        const isVideo =
                          url.toLowerCase().endsWith(".mp4") ||
                          url.toLowerCase().includes(".mov");
                        return (
                          <div
                            key={index}
                            className="relative group cursor-pointer rounded overflow-hidden"
                          >
                            {isVideo ? (
                              <video
                                src={url}
                                controls
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <img
                                src={url}
                                alt={`media-${index}`}
                                className="w-full h-full object-cover rounded hover:opacity-80 transition"
                                onClick={() => handleImageClick(index)}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Chưa có file nào.
                  </p>
                )}
              </div>
            )}
          </section>
        </>
      ) : (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-500">Loading profile...</p>
        </div>
      )}
    </main>
  );
}