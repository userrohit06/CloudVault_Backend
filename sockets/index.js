import { Server } from "socket.io";

export const initSocket = (server) => {
  const io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    socket.on("join:user", (userId) => {
      socket.join(userId);
    });

    socket.on("join:workspace", (workspaceId) => {
      socket.join(workspaceId);
    });
  });

  return io;
};
