// socket.js
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

let stompClient = null;

export const connectSocket = (userId, token, onMessage) => {
  stompClient = new Client({
    webSocketFactory: () => new SockJS('http://localhost/ws'), // Dùng SockJS thay vì brokerURL

    connectHeaders: {
      Authorization: 'Bearer ' + token
    },

    debug: function (str) {
      console.log('[STOMP]', str);
    },

    reconnectDelay: 5000,

    onConnect: () => {
      console.log('🟢 Connected to WebSocket');

      stompClient.subscribe(
        `/notifications/${userId}`,
        (message) => {
          if (message.body) {
            onMessage(JSON.parse(message.body));
          }
        },
        {
          Authorization: 'Bearer ' + token
        }
      );
    },

    onStompError: (frame) => {
      console.error('❌ STOMP error:', frame);
    }
  });

  stompClient.activate();
};

export const disconnectSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
    console.log('🔴 Disconnected from WebSocket');
  }
};
