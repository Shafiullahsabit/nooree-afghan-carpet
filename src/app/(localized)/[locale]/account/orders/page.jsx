import { CustomerRoute } from "@/components/customer-route";

export default function OrdersPage(props) {
  return <CustomerRoute {...props} path={["account", "orders"]} />;
}
