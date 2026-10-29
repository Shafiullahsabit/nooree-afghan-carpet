import Link from "next/link";
import { Icon } from "@/components/icon";

export function CarpetOverview({ locale, dictionary }) {
  return (
    <section className="craft-section" id="overview">
      <div className="craft-inner shell">
        <div className="craft-mark" aria-hidden="true">
          <span>ن</span>
          <span className="craft-mark-line" />
          <span>ن</span>
        </div>
        <div className="craft-copy">
          <p className="eyebrow">{dictionary.craft.eyebrow}</p>
          <h2>{dictionary.craft.title}</h2>
          <p>{dictionary.craft.description}</p>
          <Link className="text-link text-link-light" href={`/${locale}/heritage`}>
            {dictionary.craft.action}
            <Icon name="arrow" />
          </Link>
        </div>
        <div className="craft-side-note">
          <span className="craft-side-number">01—03</span>
          <span>{dictionary.craft.sideNote}</span>
        </div>
      </div>
    </section>
  );
}
