export function CheckoutUnavailable({ dictionary }) {
  const pages = dictionary.pages;

  return (
    <>
      <p className="notice notice-error" role="status">{pages.checkoutUnavailable}</p>
      <p className="customer-description">{pages.checkoutExplanation}</p>
      <p className="muted-copy">{pages.codOnlyConfigured} {pages.paymentProviderMissing}</p>
    </>
  );
}
