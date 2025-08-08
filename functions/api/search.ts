import { json } from '../_utils';
interface Env { DB: D1Database; }
export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim();
  if (!q) return json({ items: [] });
  const like = `%${q}%`;
  const { results } = await env.DB.prepare('SELECT id, title, content, created_at FROM posts WHERE title LIKE ? OR content LIKE ? ORDER BY created_at DESC LIMIT 50').bind(like, like).all();
  return json({ items: results || [] });
};
