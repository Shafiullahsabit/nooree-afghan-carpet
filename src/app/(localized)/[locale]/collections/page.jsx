import { CustomerRoute } from "@/components/customer-route";

export default function CollectionsPage(props) {
  return <CustomerRoute {...props} path={["collections"]} />;
}
