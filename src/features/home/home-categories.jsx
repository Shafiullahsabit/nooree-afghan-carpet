import Link from "next/link";
import { Icon } from "@/components/icon";

export function HomeCategories({ locale, dictionary, categories }) {
  const visibleCategories = categories.filter((category) => category.translation);

  return (
    <section className="home-categories shell" id="categories" aria-labelledby="categories-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{dictionary.categories.eyebrow}</p>
          <h2 id="categories-title">{dictionary.categories.title}</h2>
        </div>
        <Link className="text-link" href={`/${locale}/carpets`}>
          {dictionary.categories.browse}
          <Icon name="arrow" />
        </Link>
      </div>
      {visibleCategories.length ? (
        <div className="category-link-grid">
          {visibleCategories.map((category) => (
            <Link
              className="category-link-card"
              href={`/${locale}/carpets?category=${encodeURIComponent(category.id)}`}
              key={category.id}
            >
              <span>{category.translation.name}</span>
              <Icon name="arrow" />
            </Link>
          ))}
        </div>
      ) : (
        <p className="category-empty">{dictionary.categories.empty}</p>
      )}
    </section>
  );
}
