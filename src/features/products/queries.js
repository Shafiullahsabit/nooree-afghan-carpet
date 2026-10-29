import { getProductImageUrl } from "@/features/storage/public-image";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function localizeProduct(product, translations, images, categories = []) {
  const translation = translations.find((item) => item.product_id === product.id);
  const category = categories.find((item) => item.id === product.category_id);
  const imageRecords = images
    .filter((image) => image.product_id === product.id)
    .sort((a, b) => a.sort_order - b.sort_order);
  const localizedImages = imageRecords.map((image) => ({
    ...image,
    url: getProductImageUrl(image.storage_path),
  }));

  return {
    ...product,
    translation: translation ?? null,
    category: category?.translation ?? null,
    images: localizedImages,
    image: localizedImages.find((image) => image.is_primary)?.url ?? localizedImages[0]?.url ?? null,
  };
}

export async function getFeaturedProducts(locale, limit = 6) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { status: "unconfigured", products: [] };
  }

  const { data: products, error } = await supabase
    .from("products")
    .select("id, category_id, sku, slug, price_afn, stock_quantity, dimensions, material, origin_country_code, is_handmade")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Could not load featured products:", error.message);
    return { status: "error", products: [] };
  }

  if (!products?.length) {
    return { status: "empty", products: [] };
  }

  const ids = products.map((product) => product.id);
  const [{ data: translations, error: translationError }, { data: images, error: imageError }] =
    await Promise.all([
      supabase
        .from("product_translations")
        .select("product_id, locale, name, description")
        .in("product_id", ids)
        .eq("locale", locale),
      supabase
        .from("product_images")
        .select("product_id, storage_path, alt_text, sort_order, is_primary")
        .in("product_id", ids)
        .order("sort_order"),
    ]);

  if (translationError || imageError) {
    console.error(
      "Could not load featured product details:",
      translationError?.message ?? imageError?.message,
    );
    return { status: "error", products: [] };
  }

  const categoryIds = [...new Set(products.map((product) => product.category_id).filter(Boolean))];
  const { data: categories, error: categoryError } = categoryIds.length
    ? await supabase
        .from("categories")
        .select("id, category_translations(name, locale)")
        .in("id", categoryIds)
        .eq("is_active", true)
    : { data: [], error: null };

  if (categoryError) {
    console.error("Could not load product categories:", categoryError.message);
    return { status: "error", products: [] };
  }

  const localizedCategories = (categories ?? []).map((category) => ({
    ...category,
    translation: category.category_translations.find((item) => item.locale === locale) ?? null,
  }));
  const translatedIds = new Set((translations ?? []).map((item) => item.product_id));

  return {
    status: "ready",
    products: products
      .filter((product) => translatedIds.has(product.id))
      .map((product) => localizeProduct(product, translations ?? [], images ?? [], localizedCategories)),
  };
}

export async function getActiveCategories(locale) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { status: "unconfigured", categories: [] };
  }

  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, sort_order, category_translations(name, locale)")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .limit(12);

  if (error) {
    console.error("Could not load homepage categories:", error.message);
    return { status: "error", categories: [] };
  }

  const categories = (data ?? [])
    .map((category) => ({
      ...category,
      translation: category.category_translations.find((item) => item.locale === locale) ?? null,
    }))
    .filter((category) => category.translation);

  return {
    status: categories.length ? "ready" : "empty",
    categories,
  };
}

export async function getCartProducts(locale, items) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "unconfigured", products: [] };

  const ids = [...new Set(items.map((item) => item.id))];
  if (!ids.length) return { status: "ready", products: [] };

  const [{ data: products, error }, { data: translations, error: translationError }, { data: images, error: imageError }] =
    await Promise.all([
      supabase
        .from("products")
        .select("id, category_id, sku, slug, price_afn, stock_quantity, dimensions, material, origin_country_code")
        .in("id", ids)
        .eq("status", "published"),
      supabase
        .from("product_translations")
        .select("product_id, locale, name")
        .in("product_id", ids)
        .eq("locale", locale),
      supabase
        .from("product_images")
        .select("product_id, storage_path, alt_text, sort_order, is_primary")
        .in("product_id", ids)
        .order("sort_order"),
    ]);

  if (error || translationError || imageError) {
    const failure = error ?? translationError ?? imageError;
    console.error("Could not validate cart contents:", failure.message);
    return { status: "error", products: [] };
  }

  const localizedProducts = new Map(
    (products ?? [])
      .filter((product) => translations?.some((item) => item.product_id === product.id))
      .map((product) => [product.id, localizeProduct(product, translations ?? [], images ?? [])]),
  );
  const quantities = new Map(items.map((item) => [item.id, item.quantity]));
  const unavailableIds = [];
  const cartProducts = [];

  for (const id of ids) {
    const product = localizedProducts.get(id);
    if (!product || product.stock_quantity < 1 || product.price_afn === 0) {
      unavailableIds.push(id);
      continue;
    }

    cartProducts.push({
      ...product,
      quantity: Math.min(quantities.get(product.id) ?? 1, product.stock_quantity),
    });
  }

  return {
    status: "ready",
    products: cartProducts,
    unavailableIds,
  };
}

export async function getCatalog({ locale, search = "", categoryId = "", sort = "newest", page = 1, pageSize = 12 }) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { status: "unconfigured", products: [], categories: [], total: 0 };
  }

  const categoryPromise = supabase
    .from("categories")
    .select("id, slug, sort_order, category_translations(name, locale)")
    .eq("is_active", true)
    .order("sort_order");

  const translationPromise = supabase
    .from("product_translations")
    .select("product_id, name, description")
    .eq("locale", locale)
    .ilike("name", `%${search.replace(/[%_,]/g, "")}%`);

  const [{ data: categoryRows, error: categoryError }, { data: matchedTranslations, error: translationError }] =
    await Promise.all([categoryPromise, translationPromise]);

  if (categoryError || translationError) {
    const error = categoryError ?? translationError;
    console.error("Could not load catalog filters:", error.message);
    return { status: "error", products: [], categories: [], total: 0 };
  }

  const categories = (categoryRows ?? []).map((category) => ({
    ...category,
    translation: category.category_translations.find((item) => item.locale === locale) ?? null,
  }));
  let query = supabase
    .from("products")
    .select("id, category_id, sku, slug, price_afn, stock_quantity, dimensions, material, origin_country_code, is_handmade, created_at", {
      count: "exact",
    })
    .eq("status", "published");

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  if (search) {
    const matchedIds = (matchedTranslations ?? []).map((item) => item.product_id);
    query = matchedIds.length ? query.in("id", matchedIds) : query.eq("id", "00000000-0000-0000-0000-000000000000");
  }

  const order =
    sort === "price-asc"
      ? { column: "price_afn", ascending: true }
      : sort === "price-desc"
        ? { column: "price_afn", ascending: false }
        : { column: "created_at", ascending: false };
  const from = (page - 1) * pageSize;
  const { data: products, count, error } = await query
    .order(order.column, { ascending: order.ascending })
    .range(from, from + pageSize - 1);

  if (error) {
    console.error("Could not load catalog products:", error.message);
    return { status: "error", products: [], categories, total: 0 };
  }

  const ids = (products ?? []).map((product) => product.id);
  if (!ids.length) {
    return { status: "ready", products: [], categories, total: count ?? 0 };
  }

  const [{ data: translations, error: detailError }, { data: images, error: imageError }] =
    await Promise.all([
      supabase
        .from("product_translations")
        .select("product_id, locale, name, description")
        .in("product_id", ids)
        .eq("locale", locale),
      supabase
        .from("product_images")
        .select("product_id, storage_path, alt_text, sort_order, is_primary")
        .in("product_id", ids)
        .order("sort_order"),
    ]);

  if (detailError || imageError) {
    const detailFailure = detailError ?? imageError;
    console.error("Could not load catalog product details:", detailFailure.message);
    return { status: "error", products: [], categories, total: 0 };
  }

  const localizedProducts = (products ?? [])
    .filter((product) => translations?.some((item) => item.product_id === product.id))
    .map((product) => localizeProduct(product, translations ?? [], images ?? [], categories));

  return { status: "ready", products: localizedProducts, categories, total: count ?? 0 };
}

export async function getProductBySlug(locale, slug) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { status: "unconfigured", product: null, related: [] };
  }

  const { data: product, error } = await supabase
    .from("products")
    .select("id, category_id, sku, slug, price_afn, stock_quantity, dimensions, material, origin_country_code, is_handmade, created_at")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("Could not load product:", error.message);
    return { status: "error", product: null, related: [] };
  }

  if (!product) {
    return { status: "empty", product: null, related: [] };
  }

  const [{ data: translations, error: translationError }, { data: images, error: imageError }] =
    await Promise.all([
      supabase
        .from("product_translations")
        .select("product_id, locale, name, description")
        .eq("product_id", product.id)
        .eq("locale", locale),
      supabase
        .from("product_images")
        .select("product_id, storage_path, alt_text, sort_order, is_primary")
        .eq("product_id", product.id)
        .order("sort_order"),
    ]);

  if (translationError || imageError) {
    const detailFailure = translationError ?? imageError;
    console.error("Could not load product details:", detailFailure.message);
    return { status: "error", product: null, related: [] };
  }

  const translation = translations?.[0];
  if (!translation) {
    return { status: "empty", product: null, related: [] };
  }

  const { data: relatedRows, error: relatedError } = product.category_id
    ? await supabase
        .from("products")
        .select("id, category_id, sku, slug, price_afn, stock_quantity, dimensions, material, origin_country_code, is_handmade")
        .eq("category_id", product.category_id)
        .eq("status", "published")
        .neq("id", product.id)
        .limit(4)
    : { data: [], error: null };

  if (relatedError) {
    console.error("Could not load related products:", relatedError.message);
    return { status: "error", product: null, related: [] };
  }

  const relatedIds = (relatedRows ?? []).map((row) => row.id);
  const [{ data: relatedTranslations, error: relatedTranslationError }, { data: relatedImages, error: relatedImageError }] =
    relatedIds.length
      ? await Promise.all([
          supabase
            .from("product_translations")
            .select("product_id, locale, name, description")
            .in("product_id", relatedIds)
            .eq("locale", locale),
          supabase
            .from("product_images")
            .select("product_id, storage_path, alt_text, sort_order, is_primary")
            .in("product_id", relatedIds)
            .order("sort_order"),
        ])
      : [{ data: [], error: null }, { data: [], error: null }];

  if (relatedTranslationError || relatedImageError) {
    const relatedFailure = relatedTranslationError ?? relatedImageError;
    console.error("Could not load related product details:", relatedFailure.message);
    return { status: "error", product: null, related: [] };
  }

  return {
    status: "ready",
    product: localizeProduct(
      product,
      translations ?? [],
      images ?? [],
    ),
    related: (relatedRows ?? [])
      .filter((row) => relatedTranslations?.some((item) => item.product_id === row.id))
      .map((row) => localizeProduct(row, relatedTranslations ?? [], relatedImages ?? [])),
  };
}
