"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
  
  // Infinity scroll states
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);
  const containerRef = useRef(null);
  
  const LIMIT = 20;
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

  // Fetch posts function with pagination
  const fetchPosts = useCallback(async (skipValue = 0, isLoadMore = false) => {
    if (!routeUsername) return;
    
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.warn("Không có token đăng nhập");
      return;
    }

    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const res = await api.get(`/v1/posts/of-user/${routeUsername}?skip=${skipValue}&limit=${LIMIT}`);
      
      if (res.data.code === 200) {
        const newPosts = res.data.body || [];
        
        // If no new posts or less than LIMIT, no more data
        if (newPosts.length === 0 || newPosts.length < LIMIT) {
          setHasMore(false);
        }

        if (isLoadMore) {
          // Append new posts to existing ones
          setPosts(prevPosts => [...prevPosts, ...newPosts]);
        } else {
          // Replace posts (initial load)
          setPosts(newPosts);
          setHasMore(newPosts.length === LIMIT); // Reset hasMore for initial load
        }
        
        console.log(`Loaded ${newPosts.length} posts, skip: ${skipValue}, total posts: ${isLoadMore ? posts.length + newPosts.length : newPosts.length}`);
      }
    } catch (error) {
      console.error("Lỗi khi tải bài viết:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [routeUsername, posts.length]);

  // Initial posts load
  useEffect(() => {
    if (routeUsername) {
      console.log('Initial posts load...');
      fetchPosts(0, false);
    }
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

  // Infinity scroll handler for main container
  const handleScroll = useCallback(() => {
    // Only handle scroll for posts tab
    if (activeTab !== "posts") return;
    
    // Get the main scroll container (parent of this component)
    const scrollContainer = document.querySelector('main');
    
    if (!scrollContainer) {
      console.log('Scroll container not found');
      return;
    }

    // Prevent multiple calls
    if (loadingMore || !hasMore || loading) {
      console.log('Skip scroll:', { loadingMore, hasMore, loading });
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = scrollContainer;

    // Calculate scroll percentage
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight * 100;

    console.log('Profile scroll percentage:', scrollPercentage.toFixed(2) + '%', {
      scrollTop,
      scrollHeight,
      clientHeight,
      postsLength: posts.length
    });

    // Load more when scroll reaches 80%
    if (scrollPercentage >= 80) {
      console.log('Loading more profile posts at 80%...');
      const newSkip = posts.length;
      fetchPosts(newSkip, true);
    }
  }, [loadingMore, hasMore, loading, posts.length, fetchPosts, activeTab]);

  // Add scroll event listener to main container
  useEffect(() => {
    const scrollContainer = document.querySelector('main');
    
    if (!scrollContainer) {
      console.log('Main container not found, retrying...');
      // Retry after a short delay
      const timer = setTimeout(() => {
        const retryContainer = document.querySelector('main');
        if (retryContainer) {
          console.log('Adding scroll listener to main container for profile...');
          retryContainer.addEventListener('scroll', handleScroll);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }

    console.log('Adding scroll listener to main container for profile...');
    scrollContainer.addEventListener('scroll', handleScroll);
    
    return () => {
      console.log('Removing scroll listener from main container for profile...');
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

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

  // Post skeleton component (same as HomePage)
  const PostSkeleton = () => (
    <div className="w-full max-w-2xl bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-20"></div>
        </div>
      </div>
      
      {/* Content skeleton */}
      <div className="space-y-3 mb-4">
        <div className="h-4 bg-gray-300 rounded w-full"></div>
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      </div>
      
      {/* Image skeleton */}
      <div className="h-64 bg-gray-300 rounded-lg mb-4"></div>
      
      {/* Actions skeleton */}
      <div className="flex items-center space-x-6">
        <div className="h-8 bg-gray-300 rounded w-16"></div>
        <div className="h-8 bg-gray-300 rounded w-20"></div>
        <div className="h-8 bg-gray-300 rounded w-16"></div>
      </div>
    </div>
  );

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

          <section ref={containerRef} className="mt-6 space-y-4">
            {activeTab === "posts" ? (
              <>
                {loading && posts.length === 0 ? (
                  // Initial loading skeletons
                  <div className="space-y-6">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <PostSkeleton key={index} />
                    ))}
                  </div>
                ) : filteredPosts.length > 0 ? (
                  <>
                    {filteredPosts
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
                      ))}
                    
                    {/* Loading more skeleton */}
                    {loadingMore && (
                      <div className="space-y-6">
                        {Array.from({ length: 3 }).map((_, index) => (
                          <PostSkeleton key={`loading-${index}`} />
                        ))}
                      </div>
                    )}
                    
                    {/* No more posts indicator */}
                    {!hasMore && posts.length > 0 && (
                      <div className="flex justify-center py-4">
                        <p className="text-muted-foreground">No more posts to load.</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    {isOwnProfile ? "Chưa có bài viết nào." : "Không có bài viết nào để hiển thị."}
                  </p>
                )}
              </>
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