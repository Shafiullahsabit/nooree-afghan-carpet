import { CustomerRoute } from "@/components/customer-route";

export default async function OrderDetailsPage({ params, searchParams }) {
  const { orderNumber } = await params;
  return (
    <CustomerRoute
      params={params}
      searchParams={searchParams}
      path={["account", "orders", orderNumber]}
    />
  );
}
