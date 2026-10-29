import Link from "next/link";
import { Icon } from "@/components/icon";

export function FeaturedCollection({ locale, dictionary, products, currency }) {
  return (
    <section className="collection-section shell" id="collection">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{dictionary.collection.eyebrow}</p>
          <h2>{dictionary.collection.title}</h2>
        </div>
        <p className="section-description">{dictionary.collection.description}</p>
      </div>

      {products.some((product) => product.sample) ? (
        <div className="sample-notice" role="note">
          <span className="sample-dot" aria-hidden="true" />
          {dictionary.collection.sampleNotice}
        </div>
      ) : null}

      <div className="product-grid">
        {products.map((product, index) => {
          const details = product.details ?? product.translation;
          const price = product.price_afn ?? product.price;
          const materialDetails = [details.material, product.dimensions]
            .filter((value, valueIndex, values) => value && values.indexOf(value) === valueIndex)
            .join(" · ");

          return (
            <article className="product-card" key={product.id}>
              <div
                className={`product-image product-image-${product.id}`}
                role="img"
                aria-label={details.imageAlt ?? details.name}
                style={{
                  backgroundImage: product.image
                    ? `linear-gradient(180deg, transparent 55%, rgba(24, 22, 18, .24)), url('${product.image}')`
                    : "linear-gradient(145deg, #8b6d4b, #513d2d 52%, #ad8755)",
                }}
              >
                <span className="sample-tag">
                  {product.sample ? dictionary.collection.sampleTag : details.origin}
                </span>
                <span className="product-image-number">0{index + 1}</span>
              </div>
              <div className="product-info">
                <div className="product-title-row">
                  <div>
                    <p className="product-origin">
                      {details.origin ?? product.category?.name ?? product.origin_country_code}
                    </p>
                    <h3>{details.name}</h3>
                  </div>
                  <span className="product-price">
                    {price === 0
                      ? dictionary.product.priceOnRequest
                      : currency.format(price)}
                  </span>
                </div>
                <div className="product-bottom-row">
                  <span>{materialDetails || product.material}</span>
                  <Link
                    className="product-link"
                    href={product.slug ? `/${locale}/products/${product.slug}` : `/${locale}/carpets`}
                    aria-label={`${dictionary.collection.discover} — ${details.name}`}
                  >
                    <Icon name="arrow" />
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {products.some((product) => product.sample) ? (
        <p className="collection-footnote">{dictionary.collection.footnote}</p>
      ) : null}
    </section>
  );
}
