/**
 * getParam.ts
 * Express 5 types req.params values as `string | string[]`.
 * In practice route params are always single strings; this helper
 * extracts a guaranteed string and is type-safe under strict mode.
 */
export function getParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}
