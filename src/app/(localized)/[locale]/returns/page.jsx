import { CustomerRoute } from "@/components/customer-route";

export default function ReturnsPage(props) {
  return <CustomerRoute {...props} path={["returns"]} />;
}
