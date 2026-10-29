import { notFound } from "next/navigation";
import { getDictionary, locales } from "@/i18n/config";
import "../../globals.css";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale: locale.code }));
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const dictionary = getDictionary(locale);

  if (!dictionary) {
    return {};
  }

  return {
    title: dictionary.metadata.title,
    description: dictionary.metadata.description,
  };
}

export default async function LocalizedLayout({ children, params }) {
  const { locale } = await params;
  const dictionary = getDictionary(locale);

  if (!dictionary) {
    notFound();
  }

  return (
    <html lang={locale} dir={dictionary.direction}>
      <body>{children}</body>
    </html>
  );
}
