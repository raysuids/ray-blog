import { text } from '../_utils';
interface Env { ADMIN_KEY: string }
function fromB64url(s: string) {
  s = s.replace(/-/g,'+').replace(/_/g,'/');
  const pad = s.length % 4 ? 4 - (s.length % 4) : 0;
  s += '='.repeat(pad);
  const bin = atob(s);
  return new Uint8Array([...bin].map(c=>c.charCodeAt(0)));
}
function b64url(buf: ArrayBuffer) {
  let s = btoa(String.fromCharCode(...new Uint8Array(buf)));
  return s.replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
async function signHMAC(key: string, msg: string) {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(key), {name:'HMAC', hash:'SHA-256'}, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(msg));
  return b64url(sig);
}
export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const token = request.headers.get('x-admin-token') || '';
  if (!token.includes('.')) return text('Unauthorized', 401);
  const [payloadB64, sig] = token.split('.');
  try {
    const payload = new TextDecoder().decode(fromB64url(payloadB64));
    const { exp } = JSON.parse(payload);
    if (!exp || Date.now() > exp) return text('Expired', 401);
    const expect = await signHMAC(env.ADMIN_KEY, payload);
    if (expect !== sig) return text('Invalid', 401);
    return text('OK');
  } catch { return text('Bad', 400); }
};
