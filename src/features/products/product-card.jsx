import Link from "next/link";

export function ProductCard({ product, locale, currency, sampleLabel, priceOnRequest }) {
  const title = product.translation?.name ?? product.slug;
  const image = product.image;

  return (
    <article className="product-card">
      <Link href={`/${locale}/products/${product.slug}`} className="product-card-link">
        <div
          className="product-image"
          role="img"
          aria-label={product.images?.find((item) => item.is_primary)?.alt_text || title}
          style={{
            backgroundImage: image
              ? `linear-gradient(180deg, transparent 55%, rgba(24, 22, 18, .24)), url('${image}')`
              : "linear-gradient(145deg, #8b6d4b, #513d2d 52%, #ad8755)",
          }}
        >
          {!image ? <span className="sample-tag">{sampleLabel}</span> : null}
          <span className="product-image-number">{product.stock_quantity}</span>
        </div>
        <div className="product-info">
          <div className="product-title-row">
            <div>
              <p className="product-origin">
                {product.category?.name ?? product.origin_country_code ?? ""}
              </p>
              <h3>{title}</h3>
            </div>
            <span className="product-price">
              {product.price_afn === 0 ? priceOnRequest : currency.format(product.price_afn)}
            </span>
          </div>
          <div className="product-bottom-row">
            <span>{product.material ?? product.dimensions ?? ""}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
