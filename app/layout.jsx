export const metadata = {
  title: "Komodo DeFi Framework + WASM",
  description: "KDF Playground",
};
import "../src/index.css";
export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
      </head>
      <body className="h-full">{children}</body>
    </html>
  );
}
