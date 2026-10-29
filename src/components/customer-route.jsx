import { CustomerPage } from "@/components/customer-page";

export async function CustomerRoute({ params, searchParams, path }) {
  const { locale } = await params;
  return <CustomerPage locale={locale} path={path} searchParams={searchParams} />;
}
