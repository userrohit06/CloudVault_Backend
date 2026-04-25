export const attachIO = (io) => (req, res, next) => {
  req.io = io;
  next();
};
