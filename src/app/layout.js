import "./globals.css";

export const metadata = {
  title: "Nooree Afghan Carpet",
  description: "An Afghan shop for buying and selling carpets.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
