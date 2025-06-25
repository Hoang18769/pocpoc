import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import api from '@/utils/axios'; 

// Event constants
export const STORE_EVENTS = {
  CHAT_LIST_LOAD: 'chat_list_load',
  CHAT_CREATED: 'chat_created',
  MESSAGE_RECEIVED: 'message_received',
  NOTIFICATION_RECEIVED: 'notification_received',
  NEWSFEED_LOAD: 'newsfeed_load',
  POST_CREATED: 'post_created',
  SEARCH_PERFORMED: 'search_performed',
};

const useAppStore = create(
  devtools((set, get) => ({
    // ============ CHAT STATE ============
    chatList: [],
    conversationMap: new Map(),
    isLoadingChats: false,
    error: null,
    
    fetchChatList: async () => {
      set({ isLoadingChats: true, error: null });
      try {
        const res = await api.get('/v1/chat');
        const data = res.data.body;
        const conversationMap = new Map();
        const currentUserId = getCurrentUserId();
        
        data.forEach(chat => {
          const otherUser = chat.participants?.find(p => p.id !== currentUserId);
          if (otherUser) conversationMap.set(otherUser.id, chat.id);
        });
        
        set({ 
          chatList: data, 
          conversationMap,
          isLoadingChats: false,
          error: null
        });
        
        console.log(`📊 ${STORE_EVENTS.CHAT_LIST_LOAD} - ${data.length} chats`);
      } catch (error) {
        console.error('❌ Error fetching chats:', error);
        set({ 
          isLoadingChats: false, 
          error: 'Failed to load chats' 
        });
      }
    },

    // Mark chat as read
    markChatAsRead: async (chatId) => {
      try {
        await api.put(`/v1/chats/${chatId}/read`);
        
        // Update local state
        set(state => ({
          chatList: state.chatList.map(chat => 
            chat.chatId === chatId 
              ? { ...chat, notReadMessageCount: 0 }
              : chat
          )
        }));
        
        console.log(`✅ Marked chat ${chatId} as read`);
      } catch (error) {
        console.error('❌ Error marking chat as read:', error);
        throw error;
      }
    },

    onChatCreated: (newChat) => {
      const currentUserId = getCurrentUserId();
      const otherUser = newChat.participants?.find(p => p.id !== currentUserId);
      
      set(state => ({
        chatList: [newChat, ...state.chatList],
        conversationMap: otherUser 
          ? new Map(state.conversationMap).set(otherUser.id, newChat.id)
          : state.conversationMap
      }));
      
      console.log(`📊 ${STORE_EVENTS.CHAT_CREATED} - ${newChat.id}`);
    },
    
    onMessageReceived: (message) => {
      set(state => ({
        chatList: state.chatList
          .map(chat => {
            if (chat.chatId === message.chatId) {
              return { 
                ...chat, 
                lastMessage: message, 
                updatedAt: message.createdAt,
                // Increment unread count if not currently selected
                notReadMessageCount: (chat.notReadMessageCount || 0) + 1
              };
            }
            return chat;
          })
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      }));
      
      console.log(`📊 ${STORE_EVENTS.MESSAGE_RECEIVED} - ${message.chatId}`);
    },

    // ============ CHAT NAVIGATION & SELECTION LOGIC ============
    selectedChatId: null,
    virtualChatUser: null,
    
    navigateToChat: (userId, userInfo = null) => {
      const { chatList } = get();
      
      // Kiểm tra existing chat bằng cách so sánh username từ userInfo với target.username trong chatList
      const existingChat = chatList.find(chat => 
        chat.target && chat.target.username === userInfo?.username
      );
      
      if (existingChat) {
        console.log(`🚀 Navigating to existing chat: ${existingChat.chatId} with user: ${userId}`);
        return {
          type: 'existing',
          chatId: existingChat.chatId,
          userId: userId
        };
      } else {
        console.log(`🚀 Creating virtual chat with user: ${userId}`);
        return {
          type: 'virtual',
          chatId: null,
          userId: userId,
          userInfo: userInfo
        };
      }
    },

    selectChat: (chatId) => {
      set({ 
        selectedChatId: chatId,
        virtualChatUser: null
      });
      console.log(`✅ Selected chat: ${chatId}`);
    },

    showVirtualChat: (userId, userInfo) => {
      set({ 
        selectedChatId: null,
        virtualChatUser: {
          id: userId,
          ...userInfo
        }
      });
      console.log(`✅ Showing virtual chat with user: ${userId}`);
    },

    clearChatSelection: () => {
      set({ 
        selectedChatId: null,
        virtualChatUser: null
      });
    },

    createNewChat: async (userId, firstMessage) => {
      try {
        const res = await api.post('/v1/chat', {
          participantId: userId,
          message: firstMessage
        });
        
        if (res.data.code === 200) {
          const newChat = res.data.body;
          get().onChatCreated(newChat);
          
          set({ 
            selectedChatId: newChat.id,
            virtualChatUser: null
          });
          
          console.log(`✅ New chat created and selected: ${newChat.id}`);
          return newChat;
        }
      } catch (error) {
        console.error('❌ Error creating new chat:', error);
        throw error;
      }
    },
    
    // ============ UTILITY ============
    clearAllData: () => {
      set({
        chatList: [],
        conversationMap: new Map(),
        selectedChatId: null,
        virtualChatUser: null,
        error: null,
        isLoadingChats: false
      });
    },
    
    // Getters
    getChatByUserId: (userId) => get().conversationMap.get(userId),
    getSelectedChat: () => {
      const { selectedChatId, chatList } = get();
      return chatList.find(chat => chat.id === selectedChatId) || null;
    },
    
  }), {
    name: 'app-store'
  })
);

function getCurrentUserId() {
  return localStorage.getItem('userId') || null;
}

export default useAppStore;