-- 0002: 站點設定
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
INSERT OR IGNORE INTO settings (key, value) VALUES
('site_title','我的部落格'),
('site_subtitle','分享想法與記錄');
