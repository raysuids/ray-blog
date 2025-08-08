import { json, text } from '../../../_utils';
import { isAuthed } from '../../../_auth';
interface Env { DB: D1Database; ADMIN_KEY: string }
export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const id = (params as any).id as string;
  if (!id) return text('缺少 id', 400);
  const row = await env.DB.prepare('SELECT id, title, content, created_at FROM posts WHERE id = ?').bind(id).first();
  if (!row) return text('不存在', 404);
  return json(row);
};
export const onRequestPut: PagesFunction<Env> = async ({ env, request, params }) => {
  const id = (params as any).id as string;
  if (!(await isAuthed(env, request))) return text('未授權', 401);
  let body: any; try { body = await request.json(); } catch { return text('JSON 錯誤', 400); }
  const title = (body.title || '').toString().trim();
  const content = (body.content || '').toString().trim();
  if (!title || !content) return text('缺少欄位', 400);
  await env.DB.prepare('UPDATE posts SET title = ?, content = ? WHERE id = ?').bind(title, content, id).run();
  return text('OK');
};
export const onRequestDelete: PagesFunction<Env> = async ({ env, request, params }) => {
  const id = (params as any).id as string;
  if (!(await isAuthed(env, request))) return text('未授權', 401);
  await env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();
  await env.DB.prepare('DELETE FROM comments WHERE post_id = ?').bind(id).run();
  return text('OK');
};
