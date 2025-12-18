function handleError(res, message, code = 500) {
    res.status(code).json({ error: message });
  }
  
  module.exports = handleError;
  