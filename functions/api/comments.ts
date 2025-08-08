import { json, text, isPreflight } from '../_utils';
interface Env { DB: D1Database; }
export const onRequestOptions: PagesFunction<Env> = async () => new Response(null, { headers: {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type, x-admin-key, x-admin-token",
  "access-control-allow-methods": "GET,POST,PUT,DELETE,OPTIONS"
}});
export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const url = new URL(request.url); const post_id = url.searchParams.get('post_id');
  if (!post_id) return text('缺少 post_id', 400);
  const { results } = await env.DB.prepare('SELECT id, author, body, created_at FROM comments WHERE post_id = ? ORDER BY created_at ASC').bind(post_id).all();
  return json({ items: results || [] });
};
export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  if (isPreflight(request)) return new Response(null, { headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type, x-admin-key, x-admin-token", "access-control-allow-methods": "GET,POST,PUT,DELETE,OPTIONS" } });
  let body: any; try { body = await request.json(); } catch { return text('JSON 錯誤', 400); }
  const post_id = (body.post_id || '').toString().trim(); const author = (body.author || '').toString().slice(0, 40);
  const content = (body.body || '').toString().trim(); if (!post_id || !content) return text('缺少必要欄位', 400);
  const id = crypto.randomUUID(); const created_at = Date.now();
  await env.DB.prepare('INSERT INTO comments (id, post_id, author, body, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind(id, post_id, author, content, created_at).run(); return json({ id, created_at });
};
