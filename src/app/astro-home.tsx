import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "./components/site-header";
import { SiteFooter } from "./components/site-footer";
import { CloudBank, CompassMark, TarotDrawing } from "./components/aurora-art";
import { channel } from "./content";
import styles from "./aurora-home.module.css";
export function AstroHome() {
  return <main className={styles.page}>
    <section className={styles.hero}><SiteHeader/><div className={styles.heroMain}>
      <div className={styles.copy}><p className={styles.eyebrow}>АВРОРА · ТАРОЛОГ</p><h1 className={styles.title}>Поближе<br/><em>к себе.</em></h1><p className={styles.lead}>Карты, немного магии<br/>и разговор, в котором тебя слышат.</p><div className={styles.actions}><Link className={styles.primary} href="/services">Выбрать расклад <span aria-hidden="true">↗</span></Link><Link className={styles.aboutLink} href="/about">Об Авроре</Link></div></div>
      <div className={styles.portraitStage}><div className={styles.orbit} data-aurora-motion="orbit"><CompassMark/></div><div className={styles.floatingCards} data-aurora-motion="cards"><TarotDrawing/></div><div className={styles.portrait}><Image src="/aurora.jpg" alt="Аврора в белом платье с ангельскими крыльями" fill priority sizes="(max-width: 760px) 72vw, 400px"/></div><div className={styles.portraitCaption}><span>Аврора</span><small>на твоей стороне</small></div></div>
    </div><div className={styles.cloudBack}><CloudBank/></div><div className={styles.cloudFront} data-aurora-motion="cloud"><CloudBank/></div><span className={styles.scrollNote}>дальше — чуть ближе <i aria-hidden="true">↓</i></span></section>
    <section className={`${styles.wrap} ${styles.introduction}`} data-aurora-reveal><div><p className={styles.kicker}>01 / ДАВАЙ ЗНАКОМИТЬСЯ</p><h2>Я — Аврора.<br/><em>И здесь можно быть собой.</em></h2></div><div className={styles.introCopy}><p>Таро, путешествия и любовь к простым вещам. Помогаю разложить запутанную историю по картам — и услышать себя.</p><p>Личные вопросы разбираем один на один. А жизнь между раскладами — в моём канале.</p><a className={styles.textLink} href={channel} target="_blank" rel="noreferrer">Заглянуть в Telegram ↗</a></div></section>
    <section className={`${styles.wrap} ${styles.paths}`}><div data-aurora-reveal><p className={styles.kicker}>02 / ТВОЙ ПЕРВЫЙ ШАГ</p><h2>С чего <em>начнём?</em></h2></div><div className={styles.pathList}>
      <Link href="/services" className={styles.path} data-aurora-reveal><span className={styles.pathNumber}>I</span><div><h3>Поговорим с картами</h3><p>Таро · твой вопрос и личный разговор</p></div><TarotDrawing className={styles.pathArt}/><span className={styles.pathArrow} aria-hidden="true">↗</span></Link>
      <Link href="/readings" className={styles.path} data-aurora-reveal><span className={styles.pathNumber}>II</span><div><h3>Посмотрим на звёзды</h3><p>Натальная карта · релокация · личные разборы</p></div><CompassMark className={styles.pathArt}/><span className={styles.pathArrow} aria-hidden="true">↗</span></Link>
    </div></section><SiteFooter/>
  </main>;
}
