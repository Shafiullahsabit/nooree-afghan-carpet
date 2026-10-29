import { CustomerRoute } from "@/components/customer-route";

export default function SignInPage(props) {
  return <CustomerRoute {...props} path={["auth", "sign-in"]} />;
}
