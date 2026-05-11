export const successEnvelope = <T>(data: T, meta: Record<string, unknown> = {}) => ({
  data,
  meta,
});

export const errorEnvelope = (
  code: string,
  message: string,
  details: unknown[] = [],
  meta: Record<string, unknown> = {},
) => ({
  error: {
    code,
    message,
    details,
  },
  meta,
});
