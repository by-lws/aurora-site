import type { Metadata } from "next";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";
import { AutomaticStudio } from "../automatic-studio";
import "../astro.css";

export const metadata: Metadata = { title: "Натальная карта (экспрес) · тестовая версия", description: "Шесть коротких разделов автоматического экспресс-разбора. Персональный результат только после оплаты.", alternates: { canonical: "/natal" }, robots: { index: false, follow: true } };
export default function NatalPage() {
  return <main className="astroPage"><div className="astroTop"><SiteHeader/></div><AutomaticStudio id="natal"/><SiteFooter/></main>;
}
