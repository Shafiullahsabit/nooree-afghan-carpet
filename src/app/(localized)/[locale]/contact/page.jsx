import { CustomerRoute } from "@/components/customer-route";

export default function ContactPage(props) {
  return <CustomerRoute {...props} path={["contact"]} />;
}
