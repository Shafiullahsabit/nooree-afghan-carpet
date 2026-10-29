import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { Icon } from "@/components/icon";
import { CarpetOverview } from "@/features/home/carpet-overview";
import { FeaturedCollection } from "@/features/home/featured-collection";
import { HomeCategories } from "@/features/home/home-categories";
import { HomeHero } from "@/features/home/home-hero";
import { HomeOffers } from "@/features/home/home-offers";
import { LocationIcon } from "@/components/icons/location-icon";
import { BUSINESS_LOCATION } from "@/config/site";
import { getActiveCategories, getFeaturedProducts } from "@/features/products/queries";
import { getDictionary, locales } from "@/i18n/config";
import { sampleProducts } from "@/lib/sample-products";

export default async function LocalizedHomePage({ params }) {
  const { locale } = await params;
  const dictionary = getDictionary(locale);

  if (!dictionary) {
    notFound();
  }

  const [featuredResult, categoriesResult] = await Promise.all([
    getFeaturedProducts(locale, 3),
    getActiveCategories(locale),
  ]);
  const displayProducts = featuredResult.status === "ready" && featuredResult.products.length
    ? featuredResult.products
    : sampleProducts.map((product, index) => ({
        ...product,
        price_afn: product.price,
        stock_quantity: 1,
        dimensions: dictionary.products[index].material,
        sample: true,
        details: dictionary.products[index],
      }));
  const currency = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "AFN",
    maximumFractionDigits: 0,
  });

  return (
    <>
      <SiteHeader locale={locale} dictionary={dictionary} locales={locales} />
      <main>
        <HomeHero locale={locale} dictionary={dictionary} />

        <section className="trust-strip" aria-label={dictionary.trust.title}>
          <div className="trust-strip-inner shell">
            <span>{dictionary.trust.items[0]}</span>
            <span className="trust-divider" aria-hidden="true" />
            <span>{dictionary.trust.items[1]}</span>
            <span className="trust-divider" aria-hidden="true" />
            <span>{dictionary.trust.items[2]}</span>
          </div>
        </section>

        <HomeCategories
          locale={locale}
          dictionary={dictionary}
          categories={categoriesResult.categories}
        />
        <HomeOffers locale={locale} dictionary={dictionary} />
        <FeaturedCollection
          locale={locale}
          dictionary={dictionary}
          products={displayProducts}
          currency={currency}
        />
        <CarpetOverview locale={locale} dictionary={dictionary} />

        <section className="visit-section shell" id="visit">
          <div>
            <p className="eyebrow">{dictionary.visit.eyebrow}</p>
            <h2>{dictionary.visit.title}</h2>
          </div>
          <p>{dictionary.visit.description}</p>
          <div className="visit-actions">
            <a
              className="visit-location"
              href={BUSINESS_LOCATION.mapsUrl}
              rel="noreferrer"
              target="_blank"
            >
              <LocationIcon />
              <span>
                <strong>{dictionary.visit.locationLabel}</strong>
                <span className="location-coordinates" dir="ltr">{BUSINESS_LOCATION.coordinates}</span>
              </span>
            </a>
            <Link className="button button-outline" href={`/${locale}/contact`}>
              {dictionary.visit.action}
              <Icon name="arrow" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-inner shell">
          <Link className="footer-brand" href={`/${locale}`} aria-label={dictionary.brand.home}>
            NOOREE<span>®</span>
          </Link>
          <p>{dictionary.footer.note}</p>
          <span className="footer-credit">{dictionary.footer.credit}</span>
        </div>
      </footer>
    </>
  );
}
