// src/middleware/loggerMiddleware.js
const loggerMiddleware = store => next => action => {
  if (
    action != null &&
    typeof action === 'object' &&
    typeof action.type === 'string' &&
    action.type.startsWith('auth/')
  ) {
    console.log('[AUTH ACTION]', action);
  }
  return next(action);
};

export default loggerMiddleware;