export const sendError = (res, msg, status = 401) => {
  res.status(status).json({ message: msg });
};
