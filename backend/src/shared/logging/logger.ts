export type LoggerFields = Record<string, unknown>;

export const logger = {
  info: (message: string, fields: LoggerFields = {}) => {
    console.log(JSON.stringify({ level: "info", message, ...fields }));
  },
  error: (message: string, fields: LoggerFields = {}) => {
    console.error(JSON.stringify({ level: "error", message, ...fields }));
  },
};
