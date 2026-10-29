import { CustomerRoute } from "@/components/customer-route";

export default function CartPage(props) {
  return <CustomerRoute {...props} path={["cart"]} />;
}
