import Script from "next/script";
import "./globals.css";

export const metadata = {
  title: "Rocky Desktop Pet",
  description:
    "Rocky is a voice-first AI desktop pet that lives on your screen, remembers your routines, schedules tasks, sees your screen on request, and helps without barging in.",
  icons: {
    icon: "/favicon.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#070b0a",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body data-pet="rocky">
        {children}
        <Script src="/firebase-config.js?v=2" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
