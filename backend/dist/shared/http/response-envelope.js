export const successEnvelope = (data, meta = {}) => ({
    data,
    meta,
});
export const errorEnvelope = (code, message, details = [], meta = {}) => ({
    error: {
        code,
        message,
        details,
    },
    meta,
});
