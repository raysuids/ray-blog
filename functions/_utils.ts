export function json(data: any, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("access-control-allow-origin", "*");
  headers.set("access-control-allow-headers", "content-type, x-admin-key, x-admin-token");
  headers.set("access-control-allow-methods", "GET,POST,PUT,DELETE,OPTIONS");
  return new Response(JSON.stringify(data), { ...init, headers });
}
export function text(message: string, status = 200, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "text/plain; charset=utf-8");
  headers.set("access-control-allow-origin", "*");
  headers.set("access-control-allow-headers", "content-type, x-admin-key, x-admin-token");
  headers.set("access-control-allow-methods", "GET,POST,PUT,DELETE,OPTIONS");
  return new Response(message, { status, headers });
}
export function isPreflight(request: Request) { return request.method === "OPTIONS"; }
