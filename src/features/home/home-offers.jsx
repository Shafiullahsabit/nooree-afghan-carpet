import Link from "next/link";
import { Icon } from "@/components/icon";

export function HomeOffers({ locale, dictionary }) {
  return (
    <section className="home-offers" id="offers" aria-labelledby="offers-title">
      <div className="home-offers-inner shell">
        <div>
          <p className="eyebrow">{dictionary.offers.eyebrow}</p>
          <h2 id="offers-title">{dictionary.offers.title}</h2>
          <p>{dictionary.offers.empty}</p>
        </div>
        <Link className="button button-outline" href={`/${locale}/carpets`}>
          {dictionary.offers.action}
          <Icon name="arrow" />
        </Link>
      </div>
    </section>
  );
}
