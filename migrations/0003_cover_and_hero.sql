-- 0003: 封面與首頁圖片
ALTER TABLE posts ADD COLUMN cover_url TEXT;
INSERT OR IGNORE INTO settings (key, value) VALUES ('hero_image','');
