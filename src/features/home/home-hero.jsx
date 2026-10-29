import Link from "next/link";
import { Icon } from "@/components/icon";

export function HomeHero({ locale, dictionary }) {
  return (
    <section className="hero shell" aria-labelledby="hero-title" id="home">
      <div className="hero-copy">
        <p className="eyebrow">
          <span className="eyebrow-mark" aria-hidden="true" />
          {dictionary.hero.eyebrow}
        </p>
        <h1 id="hero-title">{dictionary.hero.title}</h1>
        <p className="hero-description">{dictionary.hero.description}</p>
        <div className="hero-actions">
          <Link className="button button-dark" href={`/${locale}#collection`}>
            {dictionary.hero.primaryAction}
            <Icon name="arrow" />
          </Link>
          <Link className="text-link" href={`/${locale}#overview`}>
            {dictionary.hero.secondaryAction}
            <Icon name="arrow" />
          </Link>
        </div>
        <div className="hero-note">
          <span className="hero-note-rule" />
          <span>{dictionary.hero.note}</span>
        </div>
      </div>

      <div className="hero-art-wrap">
        <div
          className="hero-art"
          role="img"
          aria-label={dictionary.hero.imageAlt}
          style={{
            backgroundImage:
              "linear-gradient(180deg, transparent 55%, rgba(32, 27, 21, .22)), url('https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&w=1400&q=85')",
          }}
        >
          <span className="hero-stamp">
            <span className="stamp-top">{dictionary.hero.stampTop}</span>
            <span className="stamp-star" aria-hidden="true">✳</span>
            <span className="stamp-bottom">{dictionary.hero.stampBottom}</span>
          </span>
          <span className="hero-image-caption">{dictionary.hero.imageCaption}</span>
        </div>
        <span className="hero-art-index" aria-hidden="true">01 / 03</span>
      </div>
    </section>
  );
}
