import { CustomerRoute } from "@/components/customer-route";

export default async function ProductPage({ params, searchParams }) {
  const { slug } = await params;
  return <CustomerRoute params={params} searchParams={searchParams} path={["products", slug]} />;
}
