import Link from "next/link";
import { channel, telegram } from "../content";
import { MoonCat } from "./aurora-art";
import styles from "./site-footer.module.css";
export function SiteFooter() {
  return <footer className={styles.footer}><div className={styles.wrap}><div className={styles.top}><div className={styles.invitation}><p>ЕСТЬ ВОПРОС?</p><h2>Начнём <em>с разговора.</em></h2><a href={telegram} target="_blank" rel="noreferrer">Написать Авроре <span aria-hidden="true">↗</span></a></div><div className={styles.right}><Link className={styles.logo} href="/"><MoonCat sleepy mark/><span>aurora’s room</span></Link><nav aria-label="Ссылки в подвале"><Link href="/services">Таро</Link><Link href="/readings">Разборы</Link><Link href="/about">Об Авроре</Link><Link href="/contacts">Контакты</Link><a href={channel} target="_blank" rel="noreferrer">Telegram ↗</a></nav></div></div><div className={styles.bottom}><span>© 2026 Aurora’s room</span><div><Link href="/privacy">Данные</Link><Link href="/terms">Условия</Link></div><p>Таро и астрология — практики самоисследования. Они не заменяют профессиональную помощь.</p></div></div></footer>;
}
