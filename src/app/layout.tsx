import type { Metadata } from "next";
import "@fontsource-variable/cormorant-garamond/wght.css";
import "@fontsource-variable/cormorant-garamond/wght-italic.css";
import "@fontsource-variable/manrope";
import "./globals.css";
import "./wine-theme.css";
import "./editorial.css";
import "./aurora-motion.css";
import { ScrollReveal } from "./components/scroll-reveal";

export const metadata: Metadata = {
  metadataBase: new URL("https://xoxoaurora.ru"),
  title: {
    default: "Aurora’s room — Аврора, Таро и немного магии",
    template: "%s — Aurora’s room",
  },
  description: "Таро, личные истории и бережный разговор с Авророй. Расклады, астрология и путешествие к себе.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "/",
    siteName: "Aurora’s room",
    title: "Aurora’s room — Аврора и Таро",
    description: "Таро, путешествия и личные истории с Авророй.",
    images: [{ url: "/aurora.jpg", width: 320, height: 320, alt: "Аврора — таролог Aurora’s room" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aurora’s room",
    description: "Таро и личные истории с Авророй",
    images: ["/aurora.jpg"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body><ScrollReveal />{children}</body>
    </html>
  );
}
