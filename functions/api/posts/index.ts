import { json, text, isPreflight } from '../../_utils';
import { isAuthed } from '../../_auth';
interface Env { DB: D1Database; ADMIN_KEY: string }
export const onRequestOptions: PagesFunction<Env> = async () => new Response(null, {
  headers: {
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "content-type, x-admin-key, x-admin-token",
    "access-control-allow-methods": "GET,POST,PUT,DELETE,OPTIONS"
  }
});
export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(url.searchParams.get('page_size') || '10', 10)));
  const offset = (page - 1) * pageSize;
  const total = (await env.DB.prepare('SELECT COUNT(*) as c FROM posts').first<{c:number}>('c')) || 0;
  const { results } = await env.DB.prepare('SELECT id, title, created_at, cover_url FROM posts ORDER BY created_at DESC LIMIT ? OFFSET ?').bind(pageSize, offset).all();
  return json({ items: results || [], total, page, page_size: pageSize });
};
export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  if (isPreflight(request)) return new Response(null, { headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type, x-admin-key, x-admin-token", "access-control-allow-methods": "GET,POST,PUT,DELETE,OPTIONS" } });
  if (!(await isAuthed(env, request))) return text('未授權', 401);
  let body: any; try { body = await request.json(); } catch { return text('JSON 錯誤', 400); }
  const title = (body.title || '').toString().trim();
  const content = (body.content || '').toString().trim();
  const cover_url = (body.cover_url || '').toString().trim();
  if (!title || !content) return text('缺少標題或內容', 400);
  const id = crypto.randomUUID();
  const created_at = Date.now();
  await env.DB.prepare('INSERT INTO posts (id, title, content, created_at, cover_url) VALUES (?, ?, ?, ?, ?)')
    .bind(id, title, content, created_at, cover_url || null).run();
  return json({ id, title, created_at, cover_url });
};
