import { CustomerRoute } from "@/components/customer-route";

export default function AddressesPage(props) {
  return <CustomerRoute {...props} path={["account", "addresses"]} />;
}
