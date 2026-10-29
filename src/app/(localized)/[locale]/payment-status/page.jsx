import { CustomerRoute } from "@/components/customer-route";

export default function PaymentStatusPage(props) {
  return <CustomerRoute {...props} path={["payment-status"]} />;
}
