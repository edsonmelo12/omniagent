export const createError = (code, message, statusCode, details = []) => ({
    code,
    message,
    statusCode,
    details,
});
