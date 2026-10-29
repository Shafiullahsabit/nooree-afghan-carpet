import { CustomerRoute } from "@/components/customer-route";

export default function RegisterPage(props) {
  return <CustomerRoute {...props} path={["auth", "register"]} />;
}
