export const metadata = {
  title: "Komodo DeFi Framework + WASM",
  description: "KDF Playground",
};
import "../src/index.css";
export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <title>Komodo DeFi Framework + WASM</title>
      </head>
      <body className="h-full">{children}</body>
    </html>
  );
}
