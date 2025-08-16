// app/checkout/page.tsx
import CheckoutPage from "./CheckoutClient";

export default function CheckoutPageWrapper({ searchParams }: { searchParams: { plan?: string } }) {
  const plan = searchParams.plan ?? "Unknown Plan";
  return <CheckoutPage subplan={plan} />;
}
