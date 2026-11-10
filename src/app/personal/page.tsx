import Link from "next/link";
import {SiteHeader} from "../components/site-header";
import {SiteFooter} from "../components/site-footer";
import {CatalogCards} from "../astro-components";
import styles from "../readings.module.css";
export const metadata={title:"Личные разборы с Авророй",description:"Соляр, совместимость, полный натал и другие форматы личной работы — по записи."};
export default function Personal(){return <main className={styles.page}><SiteHeader tone="dark"/><div className={styles.wrap}><Link href="/readings" className={styles.back}>← Все разборы</Link><section className={styles.intro}><div><p className={styles.kicker}>ОДИН НА ОДИН · С АВРОРОЙ</p><h1 className={styles.title}>Личные разборы.</h1><p>Выбери тему. Формат и сроки обсудим лично.</p></div></section><CatalogCards kind="personal"/><Link href="/services" className={styles.more}>Посмотреть расклады Таро ↗</Link></div><SiteFooter/></main>;}
