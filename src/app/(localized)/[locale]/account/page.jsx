import { CustomerRoute } from "@/components/customer-route";

export default function AccountPage(props) {
  return <CustomerRoute {...props} path={["account"]} />;
}
