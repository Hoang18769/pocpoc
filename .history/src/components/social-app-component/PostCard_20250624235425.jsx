import React, { useState, useRef } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Edit3, Trash2, Save, X, Eye, EyeOff, Users, Globe, Lock, Maximize2, Plus } from 'lucide-react';

// ImagePreview component for editing files
const ImagePreview = ({ images = [], onImageClick, onDelete, onAdd }) => {
  const fileInputRef = useRef(null);

  const handleAddClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onAdd?.(files);
      e.target.value = null;
    }
  };

  if (!Array.isArray(images)) return null;

  const totalItems = images.length + 1;
  const gridCols =
    totalItems <= 1 ? "grid-cols-1" :
    totalItems === 2 ? "grid-cols-2" :
    totalItems <= 4 ? "grid-cols-3" :
    "grid-cols-4";

  return (
    <div className={`grid ${gridCols} gap-2 max-h-96 overflow-hidden`}>
      {images.map((img, index) => (
        <div key={index} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden">
          {img.type === "video" ? (
            <video
              src={img.url}
              className="w-full h-full object-cover"
              controls={false}
            />
          ) : (
            <img
              src={img.url}
              alt={`Preview ${index + 1}`}
              className="w-full h-full object-cover"
            />
          )}
          
          <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onImageClick?.(index)}
              className="p-2 bg-white/80 rounded-full hover:bg-white"
              title="Xem lớn"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete?.(index)}
              className="p-2 bg-white/80 rounded-full hover:bg-white"
              title="Xóa"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
      
      <div
        onClick={handleAddClick}
        className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        <Plus className="w-8 h-8 text-gray-400" />
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

const PostCard = ({ 
  post, 
  liked, 
  likeCount, 
  onLikeToggle, 
  isOwnProfile = false, 
  isFriend = false,
  onPostUpdate,
  onPostDelete 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [editContent, setEditContent] = useState(post.content || '');
  const [editPrivacy, setEditPrivacy] = useState(post.privacy || 'PUBLIC');
  const [editImages, setEditImages] = useState(post.images || []);
  const [isSaving, setIsSaving] = useState(false);

  const isSharedPost = post.sharedPost;
  const canEdit = isOwnProfile || (post.userId === 'currentUserId'); // Replace with actual current user check
  const canEditFiles = !isSharedPost && canEdit;

  const handleEditStart = () => {
    setEditContent(post.content || '');
    setEditPrivacy(post.privacy || 'PUBLIC');
    setEditImages(post.images || []);
    setIsEditing(true);
    setShowDropdown(false);
  };

  const handleEditCancel = () => {
    setEditContent(post.content || '');
    setEditPrivacy(post.privacy || 'PUBLIC');
    setEditImages(post.images || []);
    setIsEditing(false);
  };

  const handleEditSave = async () => {
    setIsSaving(true);
    try {
      const updatedPost = {
        ...post,
        content: editContent,
        privacy: editPrivacy,
        ...(canEditFiles && { images: editImages })
      };
      
      // Call API to update post
      await onPostUpdate?.(updatedPost);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update post:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePost = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await onPostDelete?.(post.id);
      } catch (error) {
        console.error('Failed to delete post:', error);
      }
    }
    setShowDropdown(false);
  };

  const handleImageAdd = (files) => {
    const newImages = files.map(file => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image',
      file: file
    }));
    setEditImages(prev => [...prev, ...newImages]);
  };

  const handleImageDelete = (index) => {
    setEditImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageClick = (index) => {
    // Handle image preview/modal
    console.log('View image at index:', index);
  };

  const getPrivacyIcon = (privacy) => {
    switch (privacy) {
      case 'PUBLIC':
        return <Globe className="w-4 h-4" />;
      case 'FRIEND':
        return <Users className="w-4 h-4" />;
      case 'PRIVATE':
        return <Lock className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const getPrivacyLabel = (privacy) => {
    switch (privacy) {
      case 'PUBLIC':
        return 'Public';
      case 'FRIEND':
        return 'Friends';
      case 'PRIVATE':
        return 'Only me';
      default:
        return 'Public';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Post Header */}
      <div className="flex items-start justify-between p-4 pb-3">
        <div className="flex items-center space-x-3">
          <img
            src={post.user?.avatar || '/default-avatar.png'}
            alt={post.user?.username}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {post.user?.displayName || post.user?.username}
              </h3>
              {isSharedPost && (
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                  Shared
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <span>{post.createdAt}</span>
              <span>•</span>
              <div className="flex items-center space-x-1">
                {getPrivacyIcon(post.privacy)}
                <span>{getPrivacyLabel(post.privacy)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* More Options */}
        {canEdit && (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <MoreHorizontal className="w-5 h-5 text-gray-500" />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                <button
                  onClick={handleEditStart}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit post</span>
                </button>
                <button
                  onClick={handleDeletePost}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 text-red-600 dark:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete post</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Mode */}
      {isEditing ? (
        <div className="px-4 pb-4 space-y-4">
          {/* Content Editor */}
          <div>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              rows={4}
              placeholder="What's on your mind?"
            />
          </div>

          {/* Privacy Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Privacy
            </label>
            <select
              value={editPrivacy}
              onChange={(e) => setEditPrivacy(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="PUBLIC">🌍 Public</option>
              <option value="FRIEND">👥 Friends</option>
              <option value="PRIVATE">🔒 Only me</option>
            </select>
          </div>

          {/* Image Editor (only for non-shared posts) */}
          {canEditFiles && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Images & Videos
              </label>
              <ImagePreview
                images={editImages}
                onImageClick={handleImageClick}
                onDelete={handleImageDelete}
                onAdd={handleImageAdd}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleEditCancel}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 inline mr-2" />
              Cancel
            </button>
            <button
              onClick={handleEditSave}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2"></div>
              ) : (
                <Save className="w-4 h-4 inline mr-2" />
              )}
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Post Content */}
          {post.content && (
            <div className="px-4 pb-3">
              <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                {post.content}
              </p>
            </div>
          )}

          {/* Shared Post Content */}
          {isSharedPost && post.sharedPost && (
            <div className="mx-4 mb-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center space-x-3 mb-3">
                <img
                  src={post.sharedPost.user?.avatar || '/default-avatar.png'}
                  alt={post.sharedPost.user?.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {post.sharedPost.user?.displayName || post.sharedPost.user?.username}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {post.sharedPost.createdAt}
                  </p>
                </div>
              </div>
              {post.sharedPost.content && (
                <p className="text-gray-800 dark:text-gray-200 mb-3">
                  {post.sharedPost.content}
                </p>
              )}
              {post.sharedPost.images && post.sharedPost.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {post.sharedPost.images.slice(0, 4).map((img, index) => (
                    <img
                      key={index}
                      src={img.url}
                      alt={`Shared image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Post Images */}
          {post.images && post.images.length > 0 && (
            <div className="px-4 pb-4">
              <div className="grid grid-cols-2 gap-2">
                {post.images.slice(0, 4).map((img, index) => (
                  <div key={index} className="relative">
                    {img.type === 'video' ? (
                      <video
                        src={img.url}
                        className="w-full h-48 object-cover rounded-lg"
                        controls
                      />
                    ) : (
                      <img
                        src={img.url}
                        alt={`Post image ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    )}
                    {index === 3 && post.images.length > 4 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xl font-bold">
                          +{post.images.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Post Actions */}
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <button
                  onClick={onLikeToggle}
                  className={`flex items-center space-x-2 transition-colors ${
                    liked
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">{likeCount}</span>
                </button>
                
                <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{post.commentCount || 0}</span>
                </button>
                
                <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                  <Share2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Share</span>
                </button>
              </div>
              
              <button className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <Bookmark className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Demo usage
const DemoApp = () => {
  const [posts, setPosts] = useState([
    {
      id: '1',
      content: 'Just had an amazing day at the beach! 🏖️ The weather was perfect and the sunset was incredible.',
      privacy: 'PUBLIC',
      createdAt: '2 hours ago',
      liked: false,
      likeCount: 12,
      commentCount: 3,
      user: {
        username: 'johndoe',
        displayName: 'John Doe',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop',
          type: 'image'
        },
        {
          url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
          type: 'image'
        }
      ]
    },
    {
      id: '2',
      content: 'Sharing this beautiful artwork I found!',
      privacy: 'FRIEND',
      createdAt: '4 hours ago',
      liked: true,
      likeCount: 24,
      commentCount: 7,
      user: {
        username: 'jane_smith',
        displayName: 'Jane Smith',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b0c4?w=150&h=150&fit=crop&crop=face'
      },
      sharedPost: {
        id: 'shared-1',
        content: 'My latest digital art piece - "Cosmic Dreams" ✨',
        createdAt: '1 day ago',
        user: {
          username: 'artist_mike',
          displayName: 'Mike the Artist',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
        },
        images: [
          {
            url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=400&fit=crop',
            type: 'image'
          }
        ]
      }
    }
  ]);

  const handlePostUpdate = (updatedPost) => {
    setPosts(prev => prev.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
  };

  const handlePostDelete = (postId) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
  };

  const handleLikeToggle = (postId) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          liked: !post.liked,
          likeCount: post.likeCount + (post.liked ? -1 : 1)
        };
      }
      return post;
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Enhanced PostCard Demo
      </h1>
      
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          liked={post.liked}
          likeCount={post.likeCount}
          onLikeToggle={() => handleLikeToggle(post.id)}
          isOwnProfile={true} // Set to true for demo
          onPostUpdate={handlePostUpdate}
          onPostDelete={handlePostDelete}
        />
      ))}
    </div>
  );
};

export default DemoApp;