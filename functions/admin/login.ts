import { text } from '../_utils';
interface Env { ADMIN_KEY: string }
function b64url(buf: ArrayBuffer) {
  let s = btoa(String.fromCharCode(...new Uint8Array(buf)));
  return s.replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
async function signHMAC(key: string, msg: string) {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(key), {name:'HMAC', hash:'SHA-256'}, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(msg));
  return b64url(sig);
}
export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  try {
    const { key } = await request.json();
    if (!key || key !== env.ADMIN_KEY) return text('Unauthorized', 401);
    const exp = Date.now() + 24*60*60*1000;
    const payload = JSON.stringify({ exp });
    const token = btoa(payload).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'') + '.' + await signHMAC(env.ADMIN_KEY, payload);
    return new Response(JSON.stringify({ token }), { headers: { 'content-type':'application/json' } });
  } catch { return text('Bad Request', 400); }
};
