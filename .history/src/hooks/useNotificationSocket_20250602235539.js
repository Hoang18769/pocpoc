// useNotificationSocket.js
import { useEffect } from 'react';
import { connectSocket, disconnectSocket } from './socket';

function useNotificationSocket(userId) {
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token && userId) {
      connectSocket(userId, token, (msg) => {
        console.log('🔔 Notification:', msg);
        // Xử lý hiển thị thông báo tại đây
      });
    }

    return () => {
      disconnectSocket();
    };
  }, [userId]);
}

export default useNotificationSocket;
