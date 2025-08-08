# Ray Blog Pro（繁體）
- 外觀：高級黑 + 玻璃磨砂 + 入場動畫
- 功能：文章（發/改/刪）、留言（發/刪）、搜尋、後台登入（HMAC Token，24h）
- 架構：Cloudflare Pages + Functions（TS）+ D1

## 部署（GitHub + Cloudflare Pages）
1) GitHub 建倉上傳整個專案（根目錄需含 `public/`、`functions/`、`migrations/`）。
2) Cloudflare Pages → Connect to Git → Framework: None → Build command: `exit 0` → Output: `public`。
3) Settings → Functions → Bindings：新增 D1 綁定名稱 `DB` 指向你的 D1；Variables：新增 `ADMIN_KEY`。
4) D1 Console 執行 `migrations/0001_init.sql`。
5) `/admin.html` 用 `ADMIN_KEY` 登入換取 token（24h）。

部署時間：2025-08-08T03:27:34.884073Z
