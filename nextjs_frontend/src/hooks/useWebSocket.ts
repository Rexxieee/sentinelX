import { useEffect, useRef } from 'react';
import { useAlertStore, ThreatAlert } from '../store/useAlertStore';

const getWsUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://sentinelx-8lqt.onrender.com';
  const wsUrl = apiUrl.replace(/^http/, 'ws');
  return `${wsUrl}/ws/alerts`;
};

const WS_URL = getWsUrl();

export const useWebSocket = () => {
  const { addAlert, setConnectionStatus } = useAlertStore();
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  const connect = () => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      console.log('WebSocket Connected');
      setConnectionStatus(true);
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };

    ws.current.onmessage = (event) => {
      try {
        const data: ThreatAlert = JSON.parse(event.data);
        if (data.alert_type === 'Threat Detected' || data.alert_type === 'Intrusion Detected') {
          addAlert(data);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message', error);
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket Disconnected. Reconnecting in 3s...');
      setConnectionStatus(false);
      reconnectTimeout.current = setTimeout(() => {
        connect();
      }, 3000);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket Error:', error);
      ws.current?.close();
    };
  };

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  return ws.current;
};
