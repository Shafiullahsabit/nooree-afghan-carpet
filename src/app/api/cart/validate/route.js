import { getCartProducts } from "@/features/products/queries";
import { getDictionary } from "@/i18n/config";

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const locale = String(payload?.locale ?? "en");
  if (!getDictionary(locale) || !Array.isArray(payload?.items) || payload.items.length > 30) {
    return Response.json({ error: "Invalid cart." }, { status: 400 });
  }

  const items = payload.items.filter(
    (item) =>
      typeof item?.id === "string" &&
      /^[0-9a-f-]{36}$/i.test(item.id) &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0,
  );
  if (items.length !== payload.items.length) {
    return Response.json({ error: "Invalid cart items." }, { status: 400 });
  }

  const result = await getCartProducts(locale, items);
  if (result.status !== "ready") {
    return Response.json({ error: "Cart validation is currently unavailable." }, { status: 503 });
  }

  return Response.json({
    items: result.products.map(({ id, slug, price_afn, stock_quantity, quantity, translation, image }) => ({
      id,
      slug,
      price_afn,
      stock_quantity,
      quantity,
      name: translation.name,
      image,
    })),
    unavailableIds: result.unavailableIds,
  });
}
