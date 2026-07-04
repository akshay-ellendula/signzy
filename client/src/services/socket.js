// Unidirectional WebSocket client listener (Server -> Client push)
// Replaces continuous HTTP polling with zero-overhead push notifications

let socket = null;
const listeners = new Set();

let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 3;

export function connectWebSocket() {
  if (socket && (socket.readyState === WebSocket.CONNECTING || socket.readyState === WebSocket.OPEN)) {
    return;
  }

  if (import.meta.env.VITE_WS_URL === 'disabled' || reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    if (reconnectAttempts === MAX_RECONNECT_ATTEMPTS) {
      console.warn('[WebSocket] Max reconnect attempts reached. Live telemetry disabled.');
      reconnectAttempts++; // Increment so we only log once
    }
    return;
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  // In dev mode (Vite running on 5173), connect to API backend on port 5000
  // Use VITE_WS_URL if provided (for remote backend like Render), otherwise use current host or localhost
  const wsUrl = import.meta.env.VITE_WS_URL 
    ? import.meta.env.VITE_WS_URL 
    : `${protocol}//${window.location.port === '5173' || window.location.port === '3000' ? 'localhost:5000' : window.location.host}/ws`;

  try {
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      reconnectAttempts = 0; // reset on success
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        listeners.forEach((listener) => listener(payload));
      } catch (err) {
        console.error('[WebSocket] Failed to parse incoming message:', err);
      }
    };

    socket.onclose = () => {
      reconnectAttempts++;
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        setTimeout(connectWebSocket, 3000);
      } else {
        connectWebSocket(); // Trigger the warning log
      }
    };

    socket.onerror = (err) => {
      // Supress noisy connection errors on serverless backends
    };
  } catch (err) {
    console.error('[WebSocket] Initialization failed:', err);
  }
}

export function subscribeToSocket(callback) {
  listeners.add(callback);
  if (!socket || socket.readyState === WebSocket.CLOSED) {
    connectWebSocket();
  }
  return () => {
    listeners.delete(callback);
  };
}
