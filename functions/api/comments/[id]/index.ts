import { text } from '../../_utils';
import { isAuthed } from '../../_auth';
interface Env { DB: D1Database; ADMIN_KEY: string }
export const onRequestDelete: PagesFunction<Env> = async ({ env, request, params }) => {
  if (!(await isAuthed(env, request))) return text('未授權', 401);
  const id = (params as any).id as string;
  await env.DB.prepare('DELETE FROM comments WHERE id = ?').bind(id).run();
  return text('OK');
};
