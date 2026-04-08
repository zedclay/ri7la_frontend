/** Backend wraps JSON as `{ success: true, data: T }` via ResponseTransformInterceptor. */
export function unwrapApiSuccess<T>(json: unknown): T {
  if (
    json !== null &&
    typeof json === "object" &&
    "success" in json &&
    "data" in json &&
    (json as { success: unknown }).success === true
  ) {
    return (json as { data: T }).data;
  }
  return json as T;
}
