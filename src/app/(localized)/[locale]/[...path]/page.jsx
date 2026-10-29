import { CustomerPage } from "@/components/customer-page";

export default async function CustomerRoute({ params, searchParams }) {
  const { locale, path } = await params;
  return <CustomerPage locale={locale} path={path} searchParams={searchParams} />;
}
