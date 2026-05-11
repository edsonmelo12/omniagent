export const logger = {
    info: (message, fields = {}) => {
        console.log(JSON.stringify({ level: "info", message, ...fields }));
    },
    error: (message, fields = {}) => {
        console.error(JSON.stringify({ level: "error", message, ...fields }));
    },
};
