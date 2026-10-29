-- Optional, development-only sample data.
-- Uses stable IDs and INSERT ... ON CONFLICT DO NOTHING so reruns do not
-- overwrite rows. Never run this seed against production.

begin;

insert into public.categories (id, slug, sort_order, is_active)
values
  ('10000000-0000-4000-8000-000000000001', 'hand-knotted-rugs', 10, true),
  ('10000000-0000-4000-8000-000000000002', 'kilim-rugs', 20, true),
  ('10000000-0000-4000-8000-000000000003', 'runner-rugs', 30, true)
on conflict do nothing;

insert into public.category_translations (category_id, locale, name, description)
values
  ('10000000-0000-4000-8000-000000000001', 'en', 'Hand-knotted rugs', 'Traditional rugs knotted by hand in Afghanistan.'),
  ('10000000-0000-4000-8000-000000000001', 'fa-AF', 'قالین‌های دست‌باف', 'قالین‌های سنتی افغانستان که با دست گره‌بافی شده‌اند.'),
  ('10000000-0000-4000-8000-000000000001', 'ps-AF', 'لاسي غوټه شوي غالۍ', 'د افغانستان دودیزې لاسي غوټه شوې غالۍ.'),
  ('10000000-0000-4000-8000-000000000002', 'en', 'Kilim rugs', 'Flat-woven Afghan kilims with geometric patterns.'),
  ('10000000-0000-4000-8000-000000000002', 'fa-AF', 'گلیم‌ها', 'گلیم‌های تخت‌بافت افغانستان با طرح‌های هندسی.'),
  ('10000000-0000-4000-8000-000000000002', 'ps-AF', 'ګلیمونه', 'د هندسي نقشونو لرونکي د افغانستان هوار اوبدل شوي ګلیمونه.'),
  ('10000000-0000-4000-8000-000000000003', 'en', 'Runner rugs', 'Long, narrow rugs for hallways and walkways.'),
  ('10000000-0000-4000-8000-000000000003', 'fa-AF', 'قالین‌های راهرو', 'قالین‌های دراز و باریک برای راهروها.'),
  ('10000000-0000-4000-8000-000000000003', 'ps-AF', 'د دهلېز غالۍ', 'د دهلېزونو او لارو لپاره اوږدې او نرۍ غالۍ.')
on conflict do nothing;

insert into public.products (
  id, category_id, sku, slug, price_afn, compare_at_price_afn,
  status, dimensions, material, origin_country_code, is_handmade
)
values
  (
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    'DEV-HK-001', 'herat-wool-medallion',
    28500, 32000, 'published', '200 x 300 cm', 'Hand-spun Afghan wool',
    'AF', true
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000002',
    'DEV-KL-001', 'turquoise-geometric-kilim',
    14800, null, 'published', '150 x 220 cm', 'Wool, flat-woven',
    'AF', true
  ),
  (
    '20000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000003',
    'DEV-RN-001', 'baluchi-wool-runner',
    19600, null, 'published', '80 x 250 cm', 'Wool',
    'AF', true
  )
on conflict do nothing;

insert into public.product_translations (product_id, locale, name, description)
values
  (
    '20000000-0000-4000-8000-000000000001', 'en',
    'Herat Wool Medallion Rug',
    'A hand-knotted wool rug inspired by the traditional medallion designs of Herat.'
  ),
  (
    '20000000-0000-4000-8000-000000000001', 'fa-AF',
    'قالین پشمی مدالیون هرات',
    'قالین پشمی دست‌باف با الهام از طرح‌های سنتی مدالیون هرات.'
  ),
  (
    '20000000-0000-4000-8000-000000000001', 'ps-AF',
    'د هرات د وړۍ مېډالین غالۍ',
    'د هرات له دودیزو مېډالین نقشونو څخه الهام اخیستې لاسي غوټه شوې د وړۍ غالۍ.'
  ),
  (
    '20000000-0000-4000-8000-000000000002', 'en',
    'Turquoise Geometric Kilim',
    'A flat-woven wool kilim with a lively geometric pattern.'
  ),
  (
    '20000000-0000-4000-8000-000000000002', 'fa-AF',
    'گلیم هندسی فیروزه‌ای',
    'گلیم پشمی تخت‌بافت با طرح هندسی چشم‌نواز.'
  ),
  (
    '20000000-0000-4000-8000-000000000002', 'ps-AF',
    'د فیروزه يي هندسي نقش ګلیم',
    'د ښکلي هندسي نقش لرونکی هوار اوبدل شوی د وړۍ ګلیم.'
  ),
  (
    '20000000-0000-4000-8000-000000000003', 'en',
    'Baluchi Wool Runner',
    'A narrow handwoven wool runner suited to hallways and entryways.'
  ),
  (
    '20000000-0000-4000-8000-000000000003', 'fa-AF',
    'قالین راهروی پشمی بلوچی',
    'قالین باریک پشمی دست‌باف، مناسب راهرو و ورودی.'
  ),
  (
    '20000000-0000-4000-8000-000000000003', 'ps-AF',
    'بلوچي د وړۍ د دهلېز غالۍ',
    'د دهلېزونو او ننوتلو لارو لپاره نرۍ لاسي اوبدل شوې د وړۍ غالۍ.'
  )
on conflict do nothing;

insert into public.inventory_movements (
  id, product_id, movement_type, quantity_change, reference, idempotency_key, note
)
values
  (
    '30000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'receipt', 4, 'development seed', 'dev-seed-stock-hk-001',
    'Sample opening stock; replace with verified stock counts.'
  ),
  (
    '30000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000002',
    'receipt', 7, 'development seed', 'dev-seed-stock-kl-001',
    'Sample opening stock; replace with verified stock counts.'
  ),
  (
    '30000000-0000-4000-8000-000000000003',
    '20000000-0000-4000-8000-000000000003',
    'receipt', 3, 'development seed', 'dev-seed-stock-rn-001',
    'Sample opening stock; replace with verified stock counts.'
  )
on conflict do nothing;

insert into public.shipping_rates (id, country_code, rate_afn, is_active, notes)
values
  ('40000000-0000-4000-8000-000000000001', 'AF', 250, true, 'Sample domestic flat rate; confirm with carrier.'),
  ('40000000-0000-4000-8000-000000000002', 'PK', 1800, true, 'Sample international flat rate; confirm with carrier.'),
  ('40000000-0000-4000-8000-000000000003', 'AE', 2600, true, 'Sample international flat rate; confirm with carrier.'),
  ('40000000-0000-4000-8000-000000000004', 'DE', 6200, true, 'Sample international flat rate; confirm with carrier.'),
  ('40000000-0000-4000-8000-000000000005', 'GB', 6800, true, 'Sample international flat rate; confirm with carrier.'),
  ('40000000-0000-4000-8000-000000000006', 'US', 8500, true, 'Sample international flat rate; confirm with carrier.')
on conflict do nothing;

insert into public.cod_areas (id, country_code, region, city, is_active, notes)
values
  ('50000000-0000-4000-8000-000000000001', 'AF', 'Kabul', 'Kabul', true, 'Sample COD coverage; verify delivery service.'),
  ('50000000-0000-4000-8000-000000000002', 'AF', 'Herat', 'Herat', true, 'Sample COD coverage; verify delivery service.'),
  ('50000000-0000-4000-8000-000000000003', 'AF', 'Balkh', 'Mazar-i-Sharif', true, 'Sample COD coverage; verify delivery service.')
on conflict do nothing;

insert into public.business_settings (key, value, is_public, description)
values
  ('default_currency', '"AFN"'::jsonb, true, 'Store display and checkout currency.'),
  ('supported_locales', '["en", "fa-AF", "ps-AF"]'::jsonb, true, 'Supported storefront locales.'),
  ('store_name', '"Nooree Afghan Carpet"'::jsonb, true, 'Public store name.')
on conflict do nothing;

insert into public.translations (namespace, translation_key, locale, value)
values
  ('common', 'currency_name', 'en', 'Afghan afghani'),
  ('common', 'currency_name', 'fa-AF', 'افغانی افغانستان'),
  ('common', 'currency_name', 'ps-AF', 'افغانۍ'),
  ('common', 'add_to_cart', 'en', 'Add to cart'),
  ('common', 'add_to_cart', 'fa-AF', 'افزودن به سبد خرید'),
  ('common', 'add_to_cart', 'ps-AF', 'ټوکرۍ ته ورزیاتول')
on conflict do nothing;

commit;
