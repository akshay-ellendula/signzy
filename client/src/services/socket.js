// Unidirectional WebSocket client listener (Server -> Client push)
// Replaces continuous HTTP polling with zero-overhead push notifications

let socket = null;
const listeners = new Set();

export function connectWebSocket() {
  if (socket && (socket.readyState === WebSocket.CONNECTING || socket.readyState === WebSocket.OPEN)) {
    return;
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  // In dev mode (Vite running on 5173), connect to API backend on port 5000
  const host = window.location.port === '5173' || window.location.port === '3000' ? 'localhost:5000' : window.location.host;
  const wsUrl = `${protocol}//${host}/ws`;

  try {
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      // Do nothing, silently connected
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
      // Reconnect silently
      setTimeout(connectWebSocket, 3000);
    };

    socket.onerror = (err) => {
      console.error('[WebSocket] Error occurred:', err);
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
