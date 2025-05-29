import React, { useState } from 'react';
import { X, Maximize2, Edit3 } from 'lucide-react';

const ChatBox = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const conversations = [
    {
      name: "Thuỷ Anh",
      lastMessage: "Hoạt động 5 giờ trước",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c3d5?w=40&h=40&fit=crop&crop=face",
      isOnline: false
    },
    {
      name: "chị bé",
      lastMessage: "Hoàng đã gửi một file đính kèm • 20 giờ",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      isOnline: false
    },
    {
      name: "chiecaccclone",
      lastMessage: "A • 1 ngày",
      avatar: null,
      isOnline: false
    },
    {
      name: "Nguyễn Ngọc Yến Nhi",
      lastMessage: "ngủ quai lun • 2 ngày",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=40&h=40&fit=crop&crop=face",
      isOnline: false
    },
    {
      name: "Nguyet Que",
      lastMessage: "Hoạt động 3 giờ trước",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face",
      isOnline: false
    },
    {
      name: "Codeine",
      lastMessage: "k có nút đăng lại • 3 ngày",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      isOnline: false
    },
    {
      name: "Minh Thy",
      lastMessage: "Hoạt động 1 giờ trước",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face",
      isOnline: false
    }
  ];

  return (
    <div className="flex items-center justify-center min-h-screen p-4 overflow-y-auto" style={{ backgroundColor: 'var(--background)' }}>
      <div 
        className={`rounded-xl shadow-2xl transition-all duration-300 ${
          isExpanded ? 'w-full max-w-2xl h-[600px]' : 'w-full max-w-md h-[500px]'
        }`}
        style={{ 
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)'
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <h2 
            className="text-lg font-semibold"
            style={{ color: 'var(--card-foreground)' }}
          >
            Tin nhắn
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-md hover:bg-opacity-80 transition-colors"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <Maximize2 size={16} style={{ color: 'var(--accent-foreground)' }} />
            </button>
            <button
              className="p-1.5 rounded-md hover:bg-opacity-80 transition-colors"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <X size={16} style={{ color: 'var(--accent-foreground)' }} />
            </button>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 hover:bg-opacity-50 cursor-pointer transition-colors border-b"
              style={{ 
                backgroundColor: 'transparent',
                borderColor: 'var(--border)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div 
                  className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center"
                  style={{ 
                    backgroundColor: conversation.avatar ? 'transparent' : 'var(--muted)'
                  }}
                >
                  {conversation.avatar ? (
                    <img
                      src={conversation.avatar}
                      alt={conversation.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div 
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: 'var(--background)' }}
                    />
                  )}
                </div>
                {conversation.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 
                    className="font-medium truncate"
                    style={{ color: 'var(--card-foreground)' }}
                  >
                    {conversation.name}
                  </h3>
                </div>
                <p 
                  className="text-sm truncate"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  {conversation.lastMessage}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div 
          className="p-3 border-t flex justify-end"
          style={{ borderColor: 'var(--border)' }}
        >
          <button
            className="p-2 rounded-full hover:bg-opacity-80 transition-colors"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Edit3 size={18} style={{ color: 'var(--primary-foreground)' }} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;