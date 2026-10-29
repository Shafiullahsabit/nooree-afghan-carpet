import { CustomerRoute } from "@/components/customer-route";

export default function CheckoutPage(props) {
  return <CustomerRoute {...props} path={["checkout"]} />;
}
