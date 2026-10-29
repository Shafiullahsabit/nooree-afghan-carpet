import { CustomerRoute } from "@/components/customer-route";

export default function ShippingPage(props) {
  return <CustomerRoute {...props} path={["shipping"]} />;
}
