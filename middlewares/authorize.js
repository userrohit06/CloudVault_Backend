import WorkspaceMember from "../models/WorkspaceMember.js";

export const authorize = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const userId = req.user._id;

      const workspaceId = req.body.workspaceId || req.params.workspaceId;

      if (!workspaceId) {
        return res.status(400).json({
          success: false,
          message: "Workspace id required!",
        });
      }

      const member = await WorkspaceMember.findOne({
        workspace: workspaceId,
        user: userId,
      });

      if (!member) {
        return res.status(403).json({
          success: false,
          message: "Not a workspace member",
        });
      }

      if (!allowedRoles.includes(member.role)) {
        return res.status(403).json({
          success: false,
          message: "Access denied!",
        });
      }

      req.workspaceRole = member.role;
      next();
    } catch (error) {
      next(error);
    }
  };
};
