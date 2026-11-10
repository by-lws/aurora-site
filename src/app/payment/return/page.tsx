import { SiteHeader } from "../../components/site-header";
import { SiteFooter } from "../../components/site-footer";
import { PaymentResult } from "./result";
import "../../astro.css";
import "../../checkout.css";
export const metadata = { title: "Ваш разбор — Aurora", robots: { index: false, follow: false }, referrer: "no-referrer" as const };
export default function ReturnPage() { return <main className="astroPage"><div className="astroTop"><SiteHeader/></div><PaymentResult/><SiteFooter/></main>; }
