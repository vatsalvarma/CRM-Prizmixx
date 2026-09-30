import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import { useAuthStore } from '../store/authStore';

export const useWebSocket = (topic: string, onMessage: (message: any) => void) => {
  const { token } = useAuthStore();
  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const savedOnMessage = useRef(onMessage);

  useEffect(() => {
    savedOnMessage.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!token) return;

    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      onConnect: () => {
        console.log(`Connected to STOMP on topic: ${topic}`);
        setIsConnected(true);
        client.subscribe(topic, (message) => {
          console.log(`Received message on ${topic}:`, message.body);
          if (message.body && savedOnMessage.current) {
            savedOnMessage.current(JSON.parse(message.body));
          }
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
      onWebSocketClose: (evt) => {
        console.log('WebSocket closed:', evt);
        setIsConnected(false);
      },
      onWebSocketError: (evt) => {
        console.error('WebSocket error:', evt);
      }
    });

    clientRef.current = client;
    client.activate();

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [token, topic]);

  return { isConnected };
};
