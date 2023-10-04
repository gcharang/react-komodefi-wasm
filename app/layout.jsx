export const metadata = {
  title: "AtomicDEX + WASM",
  description: "MM2 Playground",
};
import "../src/index.css";
export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <title>AtomicDEX + WASM</title>
      </head>
      <body className="h-full">{children}</body>
    </html>
  );
}
