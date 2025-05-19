export function errorHandler(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error('API Error:', error);
      res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
    }
  };
} 