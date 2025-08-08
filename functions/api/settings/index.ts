import { json, text } from '../../_utils';
import { isAuthed } from '../../_auth';
interface Env { DB: D1Database; ADMIN_KEY: string }
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const rows = await env.DB.prepare('SELECT key, value FROM settings').all<{key:string,value:string}>();
  const map: Record<string, string> = {}; (rows.results || []).forEach(r => { map[r.key] = r.value; });
  return json({ site_title: map['site_title'] || '我的部落格', site_subtitle: map['site_subtitle'] || '分享想法與記錄', hero_image: map['hero_image'] || '' });
};
export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  if (!(await isAuthed(env, request))) return text('未授權', 401);
  let body: any; try { body = await request.json(); } catch { return text('JSON 錯誤', 400); }
  const t = (body.site_title || '').toString().slice(0, 80);
  const s = (body.site_subtitle || '').toString().slice(0, 160);
  const h = (body.hero_image || '').toString().slice(0, 500);
  const stmt = env.DB.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
  await stmt.bind('site_title', t || '我的部落格').run();
  await stmt.bind('site_subtitle', s || '分享想法與記錄').run();
  await stmt.bind('hero_image', h || '').run();
  return json({ ok: true });
};
