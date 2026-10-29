import { CustomerRoute } from "@/components/customer-route";

export default function CustomOrderPage(props) {
  return <CustomerRoute {...props} path={["custom-order"]} />;
}
