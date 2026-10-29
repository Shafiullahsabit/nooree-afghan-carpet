import { ClientSiteHeader } from "@/components/client-site-header";
import { BUSINESS_WHATSAPP_NUMBER, BUSINESS_WHATSAPP_URL } from "@/config/site";

export function SiteHeader({ locale, dictionary, locales }) {
  return (
    <ClientSiteHeader
      brandCaption={dictionary.brand.caption}
      brandHome={dictionary.brand.home}
      header={dictionary.header}
      locale={locale}
      locales={locales}
      whatsappNumber={BUSINESS_WHATSAPP_NUMBER}
      whatsappUrl={BUSINESS_WHATSAPP_URL}
    />
  );
}
