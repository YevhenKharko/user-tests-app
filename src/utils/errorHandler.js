module.exports = (err, req, res, next) => {
  const { message, status } = err;
  return res.status(status || 500).json({message});
};