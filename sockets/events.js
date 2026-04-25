export const emitWorkspaceEvent = (io, workspaceId, event, payload) => {
  io.to(workspaceId.toString()).emit(event, payload);
};

export const emitUserEvent = (io, userId, event, payload) => {
  io.to(userId.toString()).emit(event, payload);
};
