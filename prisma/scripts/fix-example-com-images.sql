-- One-time fix: Replace ProductImage URLs that point to example.com with a local placeholder.
-- Run in Supabase SQL Editor (or psql) when connected to your database.

UPDATE "ProductImage"
SET url = '/placeholder.jpg'
WHERE url LIKE 'https://example.com/%'
   OR url LIKE 'http://example.com/%';

-- Check how many rows were updated (run separately if needed):
-- SELECT COUNT(*) FROM "ProductImage" WHERE url = '/placeholder.jpg';
