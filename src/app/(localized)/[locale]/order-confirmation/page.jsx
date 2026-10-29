import { CustomerRoute } from "@/components/customer-route";

export default function OrderConfirmationPage(props) {
  return <CustomerRoute {...props} path={["order-confirmation"]} />;
}
