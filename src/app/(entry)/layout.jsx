import "../globals.css";

export const metadata = {
  title: "Nooree Afghan Carpet",
  description: "Afghan carpets, woven with heritage.",
};

export default function EntryLayout({ children }) {
  return (
    <html lang="en" dir="ltr">
      <body>{children}</body>
    </html>
  );
}
