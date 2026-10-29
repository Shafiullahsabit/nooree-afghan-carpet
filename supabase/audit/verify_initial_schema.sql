-- Read-only audit for the initial Nooree Afghan Carpet migration.
-- Run in the Supabase SQL Editor and return the single JSON result.
-- This statement only reads PostgreSQL catalogs; it does not modify data.

with
expected_tables(table_name) as (
  values
    ('profiles'),
    ('addresses'),
    ('categories'),
    ('category_translations'),
    ('products'),
    ('product_translations'),
    ('product_images'),
    ('inventory_movements'),
    ('shipping_rates'),
    ('cod_areas'),
    ('orders'),
    ('order_items'),
    ('payments'),
    ('custom_inquiries'),
    ('contact_messages'),
    ('translations'),
    ('business_settings')
),
expected_foreign_keys(child_table, child_column, parent_schema, parent_table, parent_column) as (
  values
    ('profiles', 'id', 'auth', 'users', 'id'),
    ('addresses', 'profile_id', 'public', 'profiles', 'id'),
    ('category_translations', 'category_id', 'public', 'categories', 'id'),
    ('products', 'category_id', 'public', 'categories', 'id'),
    ('product_translations', 'product_id', 'public', 'products', 'id'),
    ('product_images', 'product_id', 'public', 'products', 'id'),
    ('inventory_movements', 'product_id', 'public', 'products', 'id'),
    ('inventory_movements', 'created_by', 'public', 'profiles', 'id'),
    ('orders', 'profile_id', 'public', 'profiles', 'id'),
    ('orders', 'shipping_rate_id', 'public', 'shipping_rates', 'id'),
    ('orders', 'cod_area_id', 'public', 'cod_areas', 'id'),
    ('order_items', 'order_id', 'public', 'orders', 'id'),
    ('order_items', 'product_id', 'public', 'products', 'id'),
    ('payments', 'order_id', 'public', 'orders', 'id'),
    ('custom_inquiries', 'profile_id', 'public', 'profiles', 'id'),
    ('custom_inquiries', 'product_id', 'public', 'products', 'id'),
    ('contact_messages', 'profile_id', 'public', 'profiles', 'id'),
    ('business_settings', 'updated_by', 'public', 'profiles', 'id')
),
expected_indexes(table_name, index_name) as (
  values
    ('addresses', 'addresses_one_default_per_profile'),
    ('addresses', 'addresses_profile_created_idx'),
    ('category_translations', 'category_translations_locale_idx'),
    ('products', 'products_category_status_idx'),
    ('products', 'products_status_created_idx'),
    ('products', 'products_published_price_idx'),
    ('product_translations', 'product_translations_locale_idx'),
    ('product_images', 'product_images_one_primary_idx'),
    ('product_images', 'product_images_product_order_idx'),
    ('inventory_movements', 'inventory_movements_product_created_idx'),
    ('inventory_movements', 'inventory_movements_reference_idx'),
    ('cod_areas', 'cod_areas_active_country_idx'),
    ('cod_areas', 'cod_areas_location_idx'),
    ('orders', 'orders_profile_placed_idx'),
    ('orders', 'orders_status_placed_idx'),
    ('orders', 'orders_cod_area_idx'),
    ('order_items', 'order_items_order_idx'),
    ('order_items', 'order_items_product_idx'),
    ('payments', 'payments_order_created_idx'),
    ('payments', 'payments_status_created_idx'),
    ('custom_inquiries', 'custom_inquiries_profile_created_idx'),
    ('custom_inquiries', 'custom_inquiries_status_created_idx'),
    ('contact_messages', 'contact_messages_profile_created_idx'),
    ('contact_messages', 'contact_messages_status_created_idx'),
    ('translations', 'translations_locale_namespace_idx')
),
expected_policies(table_name, policy_name) as (
  values
    ('profiles', 'Profiles readable by owner or admin'),
    ('profiles', 'Profiles updateable by owner or admin'),
    ('addresses', 'Addresses manageable by owner'),
    ('categories', 'Active categories are public'),
    ('categories', 'Admins manage categories'),
    ('category_translations', 'Translations for active categories are public'),
    ('category_translations', 'Admins manage category translations'),
    ('products', 'Published products are public'),
    ('products', 'Admins manage products'),
    ('product_translations', 'Translations for published products are public'),
    ('product_translations', 'Admins manage product translations'),
    ('product_images', 'Images for published products are public'),
    ('product_images', 'Admins manage product images'),
    ('inventory_movements', 'Admins read inventory movements'),
    ('inventory_movements', 'Admins insert inventory movements'),
    ('shipping_rates', 'Active shipping rates are public'),
    ('shipping_rates', 'Admins manage shipping rates'),
    ('cod_areas', 'Active COD areas are public'),
    ('cod_areas', 'Admins manage COD areas'),
    ('orders', 'Customers read own orders'),
    ('orders', 'Admins manage orders'),
    ('order_items', 'Customers read own order items'),
    ('order_items', 'Admins manage order items'),
    ('payments', 'Customers read own payments'),
    ('payments', 'Admins manage payments'),
    ('custom_inquiries', 'Submit custom inquiries'),
    ('custom_inquiries', 'Customers read own inquiries'),
    ('custom_inquiries', 'Admins manage inquiries'),
    ('contact_messages', 'Submit contact messages'),
    ('contact_messages', 'Customers read own contact messages'),
    ('contact_messages', 'Admins manage contact messages'),
    ('translations', 'Public UI translations are readable'),
    ('translations', 'Admins manage UI translations'),
    ('business_settings', 'Public business settings are readable'),
    ('business_settings', 'Admins manage business settings')
),
expected_triggers(table_schema, table_name, trigger_name) as (
  values
    ('auth', 'users', 'on_auth_user_created'),
    ('public', 'profiles', 'profiles_protect_role'),
    ('public', 'inventory_movements', 'inventory_movement_apply'),
    ('public', 'inventory_movements', 'inventory_movement_immutable'),
    ('public', 'profiles', 'profiles_set_updated_at'),
    ('public', 'addresses', 'addresses_set_updated_at'),
    ('public', 'categories', 'categories_set_updated_at'),
    ('public', 'category_translations', 'category_translations_set_updated_at'),
    ('public', 'products', 'products_set_updated_at'),
    ('public', 'product_translations', 'product_translations_set_updated_at'),
    ('public', 'shipping_rates', 'shipping_rates_set_updated_at'),
    ('public', 'cod_areas', 'cod_areas_set_updated_at'),
    ('public', 'orders', 'orders_set_updated_at'),
    ('public', 'payments', 'payments_set_updated_at'),
    ('public', 'custom_inquiries', 'custom_inquiries_set_updated_at'),
    ('public', 'contact_messages', 'contact_messages_set_updated_at'),
    ('public', 'translations', 'translations_set_updated_at'),
    ('public', 'business_settings', 'business_settings_set_updated_at')
),
expected_functions(function_name) as (
  values
    ('set_updated_at'),
    ('is_admin'),
    ('handle_new_auth_user'),
    ('prevent_profile_role_escalation'),
    ('apply_inventory_movement'),
    ('prevent_inventory_movement_mutation'),
    ('is_cod_available'),
    ('set_profile_admin_role')
)
select pg_catalog.jsonb_pretty(
  pg_catalog.jsonb_build_object(
    'audit_context', pg_catalog.jsonb_build_object(
      'database', current_database(),
      'checked_at', pg_catalog.transaction_timestamp(),
      'expected_table_count', (select pg_catalog.count(*) from expected_tables),
      'expected_foreign_key_count', (select pg_catalog.count(*) from expected_foreign_keys),
      'expected_named_index_count', (select pg_catalog.count(*) from expected_indexes),
      'expected_policy_count', (select pg_catalog.count(*) from expected_policies),
      'expected_trigger_count', (select pg_catalog.count(*) from expected_triggers)
    ),
    'tables_and_rls', (
      select coalesce(
        pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_object(
            'table', e.table_name,
            'exists', c.oid is not null,
            'rls_enabled', coalesce(c.relrowsecurity, false),
            'force_rls', coalesce(c.relforcerowsecurity, false)
          ) order by e.table_name
        ),
        '[]'::jsonb
      )
      from expected_tables e
      left join pg_catalog.pg_class c
        on c.oid = pg_catalog.to_regclass('public.' || e.table_name)
    ),
    'columns', (
      select coalesce(
        pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_object(
            'table', e.table_name,
            'columns', (
              select coalesce(
                pg_catalog.jsonb_agg(
                  pg_catalog.jsonb_build_object(
                    'name', a.attname,
                    'type', pg_catalog.format_type(a.atttypid, a.atttypmod),
                    'nullable', not a.attnotnull,
                    'default', pg_catalog.pg_get_expr(d.adbin, d.adrelid),
                    'generated', a.attgenerated,
                    'identity', a.attidentity
                  ) order by a.attnum
                ),
                '[]'::jsonb
              )
              from pg_catalog.pg_attribute a
              left join pg_catalog.pg_attrdef d
                on d.adrelid = a.attrelid and d.adnum = a.attnum
              where a.attrelid = c.oid
                and a.attnum > 0
                and not a.attisdropped
            )
          ) order by e.table_name
        ),
        '[]'::jsonb
      )
      from expected_tables e
      join pg_catalog.pg_class c
        on c.oid = pg_catalog.to_regclass('public.' || e.table_name)
    ),
    'constraints', (
      select coalesce(
        pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_object(
            'table', c.relname,
            'name', con.conname,
            'type', con.contype,
            'definition', pg_catalog.pg_get_constraintdef(con.oid, true)
          ) order by c.relname, con.conname
        ),
        '[]'::jsonb
      )
      from pg_catalog.pg_constraint con
      join pg_catalog.pg_class c on c.oid = con.conrelid
      join pg_catalog.pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname in (select table_name from expected_tables)
    ),
    'foreign_keys', (
      select coalesce(
        pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_object(
            'table_schema', child_ns.nspname,
            'table', child.relname,
            'name', con.conname,
            'definition', pg_catalog.pg_get_constraintdef(con.oid, true)
          ) order by child_ns.nspname, child.relname, con.conname
        ),
        '[]'::jsonb
      )
      from pg_catalog.pg_constraint con
      join pg_catalog.pg_class child on child.oid = con.conrelid
      join pg_catalog.pg_namespace child_ns on child_ns.oid = child.relnamespace
      where con.contype = 'f'
        and (
          (child_ns.nspname = 'public' and child.relname in (select table_name from expected_tables))
          or (child_ns.nspname = 'auth' and child.relname = 'users')
        )
    ),
    'expected_foreign_keys', (
      select coalesce(
        pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_object(
            'from', e.child_table || '.' || e.child_column,
            'to', e.parent_schema || '.' || e.parent_table || '.' || e.parent_column,
            'exists', exists (
              select 1
              from pg_catalog.pg_constraint con
              join pg_catalog.pg_class child on child.oid = con.conrelid
              join pg_catalog.pg_namespace child_ns on child_ns.oid = child.relnamespace
              join pg_catalog.pg_class parent on parent.oid = con.confrelid
              join pg_catalog.pg_namespace parent_ns on parent_ns.oid = parent.relnamespace
              join pg_catalog.pg_attribute child_col
                on child_col.attrelid = child.oid and child_col.attnum = con.conkey[1]
              join pg_catalog.pg_attribute parent_col
                on parent_col.attrelid = parent.oid and parent_col.attnum = con.confkey[1]
              where con.contype = 'f'
                and child_ns.nspname = 'public'
                and child.relname = e.child_table
                and parent_ns.nspname = e.parent_schema
                and parent.relname = e.parent_table
                and child_col.attname = e.child_column
                and parent_col.attname = e.parent_column
                and pg_catalog.array_length(con.conkey, 1) = 1
            )
          ) order by e.child_table, e.child_column
        ),
        '[]'::jsonb
      )
      from expected_foreign_keys e
    ),
    'indexes', (
      select coalesce(
        pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_object(
            'table', t.relname,
            'name', idx.relname,
            'definition', pg_catalog.pg_get_indexdef(i.indexrelid),
            'predicate', pg_catalog.pg_get_expr(i.indpred, i.indrelid)
          ) order by t.relname, idx.relname
        ),
        '[]'::jsonb
      )
      from pg_catalog.pg_index i
      join pg_catalog.pg_class t on t.oid = i.indrelid
      join pg_catalog.pg_namespace tn on tn.oid = t.relnamespace
      join pg_catalog.pg_class idx on idx.oid = i.indexrelid
      where tn.nspname = 'public'
        and t.relname in (select table_name from expected_tables)
    ),
    'expected_named_indexes', (
      select coalesce(
        pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_object(
            'table', e.table_name,
            'index', e.index_name,
            'exists', exists (
              select 1
              from pg_catalog.pg_class actual_idx
              join pg_catalog.pg_namespace actual_ns
                on actual_ns.oid = actual_idx.relnamespace
              join pg_catalog.pg_index actual_i
                on actual_i.indexrelid = actual_idx.oid
              join pg_catalog.pg_class actual_table
                on actual_table.oid = actual_i.indrelid
              where actual_ns.nspname = 'public'
                and actual_table.relname = e.table_name
                and actual_idx.relname = e.index_name
                and actual_idx.relkind = 'i'
            )
          ) order by e.table_name, e.index_name
        ),
        '[]'::jsonb
      )
      from expected_indexes e
    ),
    'policies', (
      select coalesce(
        pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_object(
            'table', p.tablename,
            'name', p.policyname,
            'command', p.cmd,
            'permissive', p.permissive,
            'roles', p.roles,
            'using', p.qual,
            'with_check', p.with_check
          ) order by p.tablename, p.policyname
        ),
        '[]'::jsonb
      )
      from pg_catalog.pg_policies p
      where p.schemaname = 'public'
        and p.tablename in (select table_name from expected_tables)
    ),
    'expected_policies', (
      select coalesce(
        pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_object(
            'table', e.table_name,
            'policy', e.policy_name,
            'exists', p.policyname is not null
          ) order by e.table_name, e.policy_name
        ),
        '[]'::jsonb
      )
      from expected_policies e
      left join pg_catalog.pg_policies p
        on p.schemaname = 'public'
        and p.tablename = e.table_name
        and p.policyname = e.policy_name
    ),
    'triggers', (
      select coalesce(
        pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_object(
            'schema', n.nspname,
            'table', c.relname,
            'name', tr.tgname,
            'definition', pg_catalog.pg_get_triggerdef(tr.oid, true),
            'function', tr.tgfoid::regprocedure::text
          ) order by n.nspname, c.relname, tr.tgname
        ),
        '[]'::jsonb
      )
      from pg_catalog.pg_trigger tr
      join pg_catalog.pg_class c on c.oid = tr.tgrelid
      join pg_catalog.pg_namespace n on n.oid = c.relnamespace
      where not tr.tgisinternal
        and exists (
          select 1 from expected_triggers e
          where e.table_schema = n.nspname
            and e.table_name = c.relname
        )
    ),
    'expected_triggers', (
      select coalesce(
        pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_object(
            'schema', e.table_schema,
            'table', e.table_name,
            'trigger', e.trigger_name,
            'exists', tr.oid is not null,
            'definition', case when tr.oid is not null
              then pg_catalog.pg_get_triggerdef(tr.oid, true)
              else null end
          ) order by e.table_schema, e.table_name, e.trigger_name
        ),
        '[]'::jsonb
      )
      from expected_triggers e
      left join pg_catalog.pg_namespace n on n.nspname = e.table_schema
      left join pg_catalog.pg_class c on c.relnamespace = n.oid and c.relname = e.table_name
      left join pg_catalog.pg_trigger tr
        on tr.tgrelid = c.oid and tr.tgname = e.trigger_name and not tr.tgisinternal
    ),
    'security_functions', (
      select coalesce(
        pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_object(
            'name', p.proname,
            'identity_arguments', pg_catalog.pg_get_function_identity_arguments(p.oid),
            'security_definer', p.prosecdef,
            'configuration', p.proconfig,
            'execute_anon', has_function_privilege('anon', p.oid, 'EXECUTE'),
            'execute_authenticated', has_function_privilege('authenticated', p.oid, 'EXECUTE'),
            'execute_service_role', has_function_privilege('service_role', p.oid, 'EXECUTE'),
            'definition', pg_catalog.pg_get_functiondef(p.oid)
          ) order by p.proname, pg_catalog.pg_get_function_identity_arguments(p.oid)
        ),
        '[]'::jsonb
      )
      from pg_catalog.pg_proc p
      join pg_catalog.pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public'
        and p.proname in (select function_name from expected_functions)
    ),
    'missing_expected_functions', (
      select coalesce(
        pg_catalog.jsonb_agg(e.function_name order by e.function_name),
        '[]'::jsonb
      )
      from expected_functions e
      where not exists (
        select 1
        from pg_catalog.pg_proc p
        join pg_catalog.pg_namespace n on n.oid = p.pronamespace
        where n.nspname = 'public' and p.proname = e.function_name
      )
    )
  )
) as read_only_schema_audit;
