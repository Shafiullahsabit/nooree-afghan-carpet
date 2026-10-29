import { ClientSiteHeader } from "@/components/client-site-header";

export function SiteHeader({ locale, dictionary, locales }) {
  return (
    <ClientSiteHeader
      brandCaption={dictionary.brand.caption}
      brandHome={dictionary.brand.home}
      header={dictionary.header}
      locale={locale}
      locales={locales}
    />
  );
}
