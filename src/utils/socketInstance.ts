let socket: WebSocket;

export const setSocket = (ws: WebSocket) => {
  socket = ws;
};

export const getSocket = () => socket;