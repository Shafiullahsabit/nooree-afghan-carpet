import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Icon } from "@/components/icon";
import { SiteHeader } from "@/components/site-header";
import { AddToCartButton } from "@/features/cart/add-to-cart-button";
import { CartPanel } from "@/features/cart/cart-panel";
import {
  deleteAddressAction,
  saveAddressAction,
  saveProfileAction,
} from "@/features/account/actions";
import { signInAction, signOutAction, signUpAction } from "@/features/auth/actions";
import { submitContactAction } from "@/features/contact/actions";
import { submitInquiryAction } from "@/features/custom-orders/actions";
import { ProductCard } from "@/features/products/product-card";
import { CheckoutUnavailable } from "@/features/checkout/unavailable-state";
import { getDictionary, locales } from "@/i18n/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCatalog, getProductBySlug } from "@/features/products/queries";
import { getShippingRates } from "@/services/shipping";

function PageFrame({ locale, dictionary, children, eyebrow, title, description }) {
  return (
    <>
      <SiteHeader locale={locale} dictionary={dictionary} locales={locales} />
      <main className="customer-main shell">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className="customer-title">{title}</h1>
        {description ? <p className="customer-description">{description}</p> : null}
        {children}
      </main>
      <footer className="site-footer">
        <div className="footer-inner shell">
          <Link className="footer-brand" href={`/${locale}`}>
            NOOREE<span>®</span>
          </Link>
          <p>{dictionary.footer.note}</p>
          <span className="footer-credit">{dictionary.footer.credit}</span>
        </div>
      </footer>
    </>
  );
}

function ResultNotice({ result, pages }) {
  if (!result) return null;
  const messages = {
    sent: pages.sent,
    saved: pages.saved,
    deleted: pages.deleted,
    failed: pages.failed,
    invalid: pages.invalid,
    unavailable: pages.unavailable,
    "check-email": pages.checkEmail,
  };
  const message = messages[result];
  if (!message) return null;

  return (
    <p className={result === "failed" || result === "invalid" ? "notice notice-error" : "notice"} role="status">
      {message}
    </p>
  );
}

function Field({ label, name, type = "text", required = false, autoComplete, maxLength, defaultValue }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <input
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        maxLength={maxLength}
        name={name}
        required={required}
        type={type}
      />
    </label>
  );
}

function TextAreaField({ label, name, required = false, rows = 5 }) {
  return (
    <label className="form-field form-field-wide">
      <span>{label}</span>
      <textarea maxLength={5000} name={name} required={required} rows={rows} />
    </label>
  );
}

function HiddenLocale({ locale }) {
  return <input name="locale" type="hidden" value={locale} />;
}

function FormPage({ locale, dictionary, searchParams, title, description, children }) {
  return (
    <PageFrame locale={locale} dictionary={dictionary} title={title} description={description}>
      <ResultNotice result={searchParams.result} pages={dictionary.pages} />
      {children}
    </PageFrame>
  );
}

function ContactForm({ locale, dictionary, action = submitContactAction, inquiry = false }) {
  const pages = dictionary.pages;

  return (
    <form action={action} className="form-card">
      <HiddenLocale locale={locale} />
      <label className="honeypot" aria-hidden="true">
        {pages.website}
        <input autoComplete="off" name="website" tabIndex={-1} />
      </label>
      <div className="form-grid">
        <Field autoComplete="name" label={pages.name} maxLength={160} name="name" required />
        <Field autoComplete="email" label={pages.email} maxLength={320} name="email" required type="email" />
        <Field autoComplete="tel" label={pages.phone} maxLength={40} name="phone" />
        {inquiry ? (
          <TextAreaField label={pages.details} name="details" required rows={7} />
        ) : (
          <>
            <Field label={pages.subject} maxLength={200} name="subject" required />
            <TextAreaField label={pages.message} name="message" required rows={7} />
          </>
        )}
      </div>
      <button className="button button-dark" type="submit">{pages.send}</button>
    </form>
  );
}

async function CatalogPage({ locale, dictionary, searchParams }) {
  const query = await searchParams;
  const pageNumber = Math.max(1, Math.min(1000, Number.parseInt(query.page ?? "1", 10) || 1));
  const search = typeof query.q === "string" ? query.q.slice(0, 100) : "";
  const categoryId = typeof query.category === "string" ? query.category : "";
  const sort = ["price-asc", "price-desc"].includes(query.sort) ? query.sort : "newest";
  const catalog = await getCatalog({ locale, search, categoryId, sort, page: pageNumber });
  const currency = new Intl.NumberFormat(locale, { style: "currency", currency: "AFN", maximumFractionDigits: 0 });
  const maxPage = Math.max(1, Math.ceil(catalog.total / 12));
  const pages = dictionary.catalog;

  return (
    <PageFrame locale={locale} dictionary={dictionary} eyebrow={pages.results} title={pages.title} description={pages.description}>
      {catalog.status !== "ready" ? (
        <p className="notice">{pages.unavailable}</p>
      ) : (
        <>
          <form action={`/${locale}/carpets`} className="catalog-filters">
            <label className="form-field">
              <span>{pages.search}</span>
              <input defaultValue={search} maxLength={100} name="q" type="search" />
            </label>
            <label className="form-field">
              <span>{pages.category}</span>
              <select defaultValue={categoryId} name="category">
                <option value="">{pages.allCategories}</option>
                {catalog.categories.map((category) => (
                  category.translation ? (
                    <option key={category.id} value={category.id}>{category.translation.name}</option>
                  ) : null
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>{pages.sort}</span>
              <select defaultValue={sort} name="sort">
                <option value="newest">{pages.newest}</option>
                <option value="price-asc">{pages.priceAscending}</option>
                <option value="price-desc">{pages.priceDescending}</option>
              </select>
            </label>
            <button className="button button-dark catalog-submit" type="submit">{pages.apply}</button>
            <Link className="text-link" href={`/${locale}/carpets`}>{pages.clear}</Link>
          </form>
          {catalog.products.length ? (
            <div className="product-grid">
              {catalog.products.map((product) => (
                <ProductCard
                  currency={currency}
                  key={product.id}
                  locale={locale}
                  product={product}
                  sampleLabel={pages.sample}
                  priceOnRequest={dictionary.product.priceOnRequest}
                />
              ))}
            </div>
          ) : (
            <p className="empty-state">{pages.empty}</p>
          )}
          <nav className="pagination" aria-label={pages.results}>
            <span>{pages.page} {pageNumber} / {maxPage}</span>
            {pageNumber > 1 ? (
              <Link href={`/${locale}/carpets?q=${encodeURIComponent(search)}&category=${encodeURIComponent(categoryId)}&sort=${sort}&page=${pageNumber - 1}`}>
                {pages.previous}
              </Link>
            ) : null}
            {pageNumber < maxPage ? (
              <Link href={`/${locale}/carpets?q=${encodeURIComponent(search)}&category=${encodeURIComponent(categoryId)}&sort=${sort}&page=${pageNumber + 1}`}>
                {pages.next}
              </Link>
            ) : null}
          </nav>
        </>
      )}
    </PageFrame>
  );
}

async function ProductDetailPage({ locale, dictionary, slug }) {
  const result = await getProductBySlug(locale, slug);
  const text = dictionary.product;
  const pages = dictionary.pages;
  const currency = new Intl.NumberFormat(locale, { style: "currency", currency: "AFN", maximumFractionDigits: 0 });

  if (result.status !== "ready" || !result.product) {
    return (
      <PageFrame locale={locale} dictionary={dictionary} title={text.description}>
        <p className="notice">{result.status === "unconfigured" ? pages.notConfigured : pages.noProduct}</p>
      </PageFrame>
    );
  }

  const product = result.product;

  return (
    <PageFrame
      locale={locale}
      dictionary={dictionary}
      eyebrow={product.category?.name ?? product.origin_country_code}
      title={product.translation.name}
      description={product.translation.description}
    >
      <div className="product-detail">
        <div className="product-gallery" aria-label={text.gallery}>
          {product.images.map((image) => (
            <div
              className="gallery-image"
              key={image.storage_path}
              role="img"
              aria-label={image.alt_text || product.translation.name}
              style={{
                backgroundImage: image.url
                  ? `url('${image.url}')`
                  : "linear-gradient(145deg, #8b6d4b, #513d2d 52%, #ad8755)",
              }}
            />
          ))}
          {!product.images.length ? (
            <div className="gallery-image" role="img" aria-label={pages.imageUnavailable} />
          ) : null}
        </div>
        <section className="product-detail-copy">
          <p className="product-price product-detail-price">
            {product.price_afn === 0 ? text.priceOnRequest : currency.format(product.price_afn)}
          </p>
          <p>{product.stock_quantity > 0 ? `${text.stock}: ${product.stock_quantity}` : text.outOfStock}</p>
          {product.translation.description ? <p>{product.translation.description}</p> : null}
          <dl className="product-specs">
            <div><dt>{text.dimensions}</dt><dd>{product.dimensions || "—"}</dd></div>
            <div><dt>{text.material}</dt><dd>{product.material || "—"}</dd></div>
            <div><dt>{text.origin}</dt><dd>{product.origin_country_code || "—"}</dd></div>
          </dl>
          {product.price_afn === 0 ? (
            <Link className="button button-outline" href={`/${locale}/custom-order`}>
              {pages.inquirePrice}
              <Icon name="arrow" />
            </Link>
          ) : (
            <AddToCartButton
              product={product}
              label={{ add: text.addToCart, added: text.addedToCart }}
              unavailableLabel={product.stock_quantity > 0 ? text.priceOnRequest : text.unavailable}
            />
          )}
        </section>
      </div>
      {result.related.length ? (
        <section className="related-section">
          <h2>{text.related}</h2>
          <div className="product-grid">
            {result.related.map((related) => (
              <ProductCard
                currency={currency}
                key={related.id}
                locale={locale}
                product={related}
                sampleLabel={pages.sample}
                priceOnRequest={text.priceOnRequest}
              />
            ))}
          </div>
        </section>
      ) : null}
    </PageFrame>
  );
}

async function AuthPage({ locale, dictionary, searchParams, register }) {
  const pages = dictionary.pages;
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    const { data } = await supabase.auth.getUser();
    if (data.user) redirect(`/${locale}/account`);
  }
  const action = register ? signUpAction : signInAction;

  return (
    <FormPage
      locale={locale}
      dictionary={dictionary}
      searchParams={params}
      title={register ? pages.register : pages.login}
    >
      <form action={action} className="form-card form-card-narrow">
        <HiddenLocale locale={locale} />
        {register ? <Field autoComplete="name" label={pages.name} maxLength={160} name="full_name" required /> : null}
        <Field autoComplete="email" label={pages.email} maxLength={320} name="email" required type="email" />
        <Field
          autoComplete={register ? "new-password" : "current-password"}
          label={pages.password}
          maxLength={128}
          name="password"
          required
          type="password"
        />
        <button className="button button-dark" type="submit">
          {register ? pages.register : pages.login}
        </button>
        <p>
          <Link href={`/${locale}/auth/${register ? "sign-in" : "register"}`}>
            {register ? pages.login : pages.register}
          </Link>
        </p>
      </form>
    </FormPage>
  );
}

async function AccountPage({ locale, dictionary, searchParams }) {
  const pages = dictionary.pages;
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: authData } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (!authData.user) {
    return (
      <PageFrame locale={locale} dictionary={dictionary} title={pages.account}>
        <p className="notice">{pages.signInRequired}</p>
        <Link className="button button-dark" href={`/${locale}/auth/sign-in`}>{pages.login}</Link>
      </PageFrame>
    );
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name, phone, preferred_locale")
    .eq("id", authData.user.id)
    .maybeSingle();
  if (error) console.error("Could not load customer profile:", error.message);

  return (
    <PageFrame locale={locale} dictionary={dictionary} title={pages.account}>
      <ResultNotice result={params.result} pages={pages} />
      {error ? <p className="notice notice-error">{pages.unavailable}</p> : null}
      {profile ? (
        <form action={saveProfileAction} className="form-card form-card-narrow">
          <HiddenLocale locale={locale} />
          <Field autoComplete="name" defaultValue={profile.full_name} label={pages.name} maxLength={160} name="full_name" required />
          <Field autoComplete="tel" defaultValue={profile.phone ?? ""} label={pages.phone} maxLength={40} name="phone" />
          <label className="form-field">
            <span>{pages.language}</span>
            <select defaultValue={profile.preferred_locale} name="preferred_locale">
              {locales.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}
            </select>
          </label>
          <button className="button button-dark" type="submit">{pages.save}</button>
        </form>
      ) : null}
      <div className="account-links">
        <Link href={`/${locale}/account/addresses`}>{pages.addresses}</Link>
        <Link href={`/${locale}/account/orders`}>{pages.orders}</Link>
        <form action={signOutAction}><HiddenLocale locale={locale} /><button className="inline-button" type="submit">{pages.signOut}</button></form>
      </div>
    </PageFrame>
  );
}

async function AddressPage({ locale, dictionary, searchParams }) {
  const pages = dictionary.pages;
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: authData } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  if (!authData.user) redirect(`/${locale}/auth/sign-in`);

  const { data: addresses, error } = await supabase
    .from("addresses")
    .select("id, recipient_name, phone, country_code, region, city, address_line1, address_line2, postal_code, is_default")
    .eq("profile_id", authData.user.id)
    .order("created_at", { ascending: false });
  if (error) console.error("Could not load customer addresses:", error.message);

  return (
    <FormPage locale={locale} dictionary={dictionary} searchParams={params} title={pages.addresses}>
      {error ? <p className="notice notice-error">{pages.unavailable}</p> : null}
      {addresses?.length ? addresses.map((address) => (
        <article className="address-card" key={address.id}>
          <strong>{address.recipient_name}{address.is_default ? " · ✓" : ""}</strong>
          <p>{address.address_line1}{address.address_line2 ? `, ${address.address_line2}` : ""}</p>
          <p>{address.city}, {address.region} · {address.country_code} · {address.phone}</p>
          <form action={deleteAddressAction}>
            <HiddenLocale locale={locale} />
            <input name="address_id" type="hidden" value={address.id} />
            <button className="inline-button" type="submit">{pages.delete}</button>
          </form>
        </article>
      )) : !error ? <p className="muted-copy">{pages.noAddresses}</p> : null}
      <form action={saveAddressAction} className="form-card">
        <HiddenLocale locale={locale} />
        <div className="form-grid">
          <Field label={pages.recipient} name="recipient_name" required />
          <Field label={pages.phone} name="phone" required />
          <Field label={pages.countryCode} maxLength={2} name="country_code" required />
          <Field label={pages.region} name="region" required />
          <Field label={pages.city} name="city" required />
          <Field label={pages.postalCode} name="postal_code" />
          <Field label={pages.addressLine1} name="address_line1" required />
          <Field label={pages.addressLine2} name="address_line2" />
          <label className="check-field"><input name="is_default" type="checkbox" />{pages.defaultAddress}</label>
        </div>
        <button className="button button-dark" type="submit">{pages.addAddress}</button>
      </form>
    </FormPage>
  );
}

async function OrdersPage({ locale, dictionary, orderNumber }) {
  const pages = dictionary.pages;
  const supabase = await createSupabaseServerClient();
  const { data: authData } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  if (!authData.user) redirect(`/${locale}/auth/sign-in`);

  let query = supabase
    .from("orders")
    .select(orderNumber
      ? "id, order_number, status, total_afn, placed_at, shipping_address"
      : "id, order_number, status, total_afn, placed_at")
    .order("placed_at", { ascending: false });
  if (orderNumber) query = query.eq("order_number", orderNumber).limit(1);
  const { data: orders, error } = await query;
  if (error) console.error("Could not load customer orders:", error.message);
  const selectedOrder = orderNumber ? orders?.[0] : null;
  const { data: items, error: itemsError } = selectedOrder
    ? await supabase
        .from("order_items")
        .select("id, product_name, product_sku, quantity, unit_price_afn, line_total_afn")
        .eq("order_id", selectedOrder.id)
        .order("created_at")
    : { data: [], error: null };
  if (itemsError) console.error("Could not load order items:", itemsError.message);
  const currency = new Intl.NumberFormat(locale, { style: "currency", currency: "AFN", maximumFractionDigits: 0 });

  return (
    <PageFrame locale={locale} dictionary={dictionary} title={orderNumber ? pages.orderNumber : pages.orders}>
      {error ? <p className="notice notice-error">{pages.unavailable}</p> : null}
      {!error && orderNumber && !selectedOrder ? <p className="notice">{pages.orderMissing}</p> : null}
      {!error && !orderNumber && !orders?.length ? <p className="muted-copy">{pages.noOrders}</p> : null}
      {orders?.map((order) => (
        <section key={order.id}>
          <article className="order-row">
            {orderNumber
              ? <strong>{order.order_number}</strong>
              : <Link href={`/${locale}/account/orders/${order.order_number}`}>{order.order_number}</Link>}
            <span>{dictionary.orderStatus[order.status] ?? order.status}</span>
            <span>{new Date(order.placed_at).toLocaleDateString(locale)}</span>
            <strong>{currency.format(order.total_afn)}</strong>
          </article>
          {orderNumber ? (
            <div className="order-detail">
              <h2>{pages.items}</h2>
              {itemsError ? <p className="notice notice-error">{pages.unavailable}</p> : null}
              {items?.map((item) => (
                <article className="order-item" key={item.id}>
                  <span>{item.product_name} <small>({item.product_sku})</small></span>
                  <span>{item.quantity} × {currency.format(item.unit_price_afn)}</span>
                  <strong>{currency.format(item.line_total_afn)}</strong>
                </article>
              ))}
              <h2>{pages.shipping}</h2>
              <p className="muted-copy">
                {[
                  order.shipping_address?.recipient_name,
                  order.shipping_address?.address_line1,
                  order.shipping_address?.city,
                  order.shipping_address?.region,
                  order.shipping_address?.country_code,
                ].filter(Boolean).join(", ")}
              </p>
            </div>
          ) : null}
        </section>
      ))}
    </PageFrame>
  );
}

async function EditorialPage({ locale, dictionary, slug, searchParams }) {
  const pages = dictionary.pages;
  const editorial = dictionary.editorial;
  const text = pages;
  const params = await searchParams;
  const keys = {
    collections: ["collections", text.collectionsTitle, text.collectionsText],
    heritage: ["heritage", text.heritageTitle, text.heritageText],
    "carpet-care": ["carpetCare", text.careTitle, text.careText],
    shipping: ["shipping", editorial.shipping, text.shippingDraft],
    returns: ["returns", editorial.returns, text.returnsDraft],
    privacy: ["privacy", editorial.privacy, text.privacyDraft],
    terms: ["terms", editorial.terms, text.termsDraft],
    contact: ["contact", editorial.contact, text.contactText],
    "custom-order": ["customOrder", editorial.customOrder, text.wholesaleText],
  };
  const [key, title, description] = keys[slug] ?? [];
  if (!key) notFound();

  if (slug === "collections") {
    const catalog = await getCatalog({ locale, page: 1, pageSize: 24 });
    const currency = new Intl.NumberFormat(locale, { style: "currency", currency: "AFN", maximumFractionDigits: 0 });
    return (
      <PageFrame locale={locale} dictionary={dictionary} title={title} description={description}>
        {catalog.status === "ready" ? (
          <div className="collection-links">
            {catalog.categories.filter((category) => category.translation).map((category) => (
              <Link href={`/${locale}/carpets?category=${category.id}`} key={category.id}>
                {category.translation.name}
              </Link>
            ))}
          </div>
        ) : <p className="notice">{dictionary.catalog.unavailable}</p>}
        {catalog.products.length ? <div className="product-grid">{catalog.products.map((product) => (
          <ProductCard key={product.id} product={product} locale={locale} currency={currency} sampleLabel={dictionary.catalog.sample} priceOnRequest={dictionary.product.priceOnRequest} />
        ))}</div> : null}
      </PageFrame>
    );
  }

  if (slug === "contact" || slug === "custom-order") {
    return (
      <FormPage locale={locale} dictionary={dictionary} searchParams={params} title={title} description={description}>
        {slug === "contact" || slug === "custom-order" ? (
          <div className="business-contact">
            <span>{pages.phoneUnavailable}: {process.env.NEXT_PUBLIC_BUSINESS_PHONE || "—"}</span>
            <span>{pages.whatsappUnavailable}: {process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || "—"}</span>
            <span>{pages.locationUnavailable}: {process.env.NEXT_PUBLIC_BUSINESS_LOCATION || "—"}</span>
          </div>
        ) : null}
        <ContactForm locale={locale} dictionary={dictionary} inquiry={slug === "custom-order"} action={slug === "custom-order" ? submitInquiryAction : submitContactAction} />
      </FormPage>
    );
  }

  const legal = ["shipping", "returns", "privacy", "terms"].includes(slug);
  let rates;
  if (slug === "shipping") rates = await getShippingRates();

  return (
    <PageFrame locale={locale} dictionary={dictionary} eyebrow={editorial.policyReview} title={title} description={description}>
      {legal ? <p className="notice">{editorial.policyReview}</p> : null}
      {slug === "shipping" ? (
        rates.status === "ready" && rates.rates.length ? (
          <div className="shipping-table">
            {rates.rates.map((rate) => (
              <div key={rate.id}><span>{rate.country_code}</span><strong>{new Intl.NumberFormat(locale, { style: "currency", currency: "AFN", maximumFractionDigits: 0 }).format(rate.rate_afn)}</strong></div>
            ))}
          </div>
        ) : <p className="notice">{pages.shippingUnavailable}</p>
      ) : null}
    </PageFrame>
  );
}

export async function CustomerPage({ locale, path, searchParams }) {
  const dictionary = getDictionary(locale);
  if (!dictionary) notFound();
  const [first, second, third] = path;
  const pages = dictionary.pages;

  if (first === "products" && second) return <ProductDetailPage locale={locale} dictionary={dictionary} slug={second} />;
  if (first === "carpets") return <CatalogPage locale={locale} dictionary={dictionary} searchParams={searchParams} />;
  if (first === "cart") {
    return (
      <PageFrame locale={locale} dictionary={dictionary} title={pages.cart}>
        <CartPanel locale={locale} dictionary={dictionary} />
      </PageFrame>
    );
  }
  if (first === "checkout") {
    const supabase = await createSupabaseServerClient();
    const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
    if (!data.user) {
      return (
        <PageFrame locale={locale} dictionary={dictionary} title={pages.checkout}>
          <p className="notice">{pages.signInRequired}</p>
          <Link className="button button-dark" href={`/${locale}/auth/sign-in`}>{pages.login}</Link>
        </PageFrame>
      );
    }
    return (
      <PageFrame locale={locale} dictionary={dictionary} title={pages.checkout}>
        <CheckoutUnavailable dictionary={dictionary} />
      </PageFrame>
    );
  }
  if (first === "auth" && second === "sign-in") return <AuthPage locale={locale} dictionary={dictionary} searchParams={searchParams} />;
  if (first === "auth" && second === "register") return <AuthPage locale={locale} dictionary={dictionary} searchParams={searchParams} register />;
  if (first === "account" && !second) return <AccountPage locale={locale} dictionary={dictionary} searchParams={searchParams} />;
  if (first === "account" && second === "addresses") return <AddressPage locale={locale} dictionary={dictionary} searchParams={searchParams} />;
  if (first === "account" && second === "orders") return <OrdersPage locale={locale} dictionary={dictionary} orderNumber={third} />;
  if (first === "order-confirmation" || first === "payment-status") {
    return (
      <PageFrame locale={locale} dictionary={dictionary} title={first === "order-confirmation" ? pages.orderNumber : pages.paymentPending}>
        <p className="notice">{first === "payment-status" ? pages.unverified : pages.orderMissing}</p>
      </PageFrame>
    );
  }

  if (["collections", "heritage", "carpet-care", "shipping", "returns", "privacy", "terms", "contact", "custom-order"].includes(first)) {
    return <EditorialPage locale={locale} dictionary={dictionary} slug={first} searchParams={searchParams} />;
  }

  notFound();
}
