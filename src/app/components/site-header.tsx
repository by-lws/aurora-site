"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { channel, telegram } from "../content";
import { CloudBank, MoonCat } from "./aurora-art";
import styles from "./site-header.module.css";
const items = [
  ["01", "Главная", "/"], ["02", "Таро", "/services"], ["03", "Разборы", "/readings"],
  ["04", "Об Авроре", "/about"], ["05", "Обучение", "/training"], ["06", "Контакты", "/contacts"],
] as const;
export function SiteHeader({ tone = "light" }: { tone?: "light" | "dark" }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const trigger = useRef<HTMLButtonElement>(null), panel = useRef<HTMLDivElement>(null), close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    document.body.classList.add("menuOpen");
    const background = document.querySelector("main");
    const previousInert = background?.inert || false;
    if (background) background.inert = true;
    const focusFrame = window.requestAnimationFrame(() => close.current?.focus());
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setOpen(false); }
      if (event.key !== "Tab") return;
      const focusable = Array.from(panel.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])') || []);
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (!panel.current?.contains(document.activeElement)) { event.preventDefault(); first?.focus(); }
      else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    window.addEventListener("keydown", keydown);
    return () => { window.cancelAnimationFrame(focusFrame); if (background) background.inert = previousInert; document.body.classList.remove("menuOpen"); window.removeEventListener("keydown", keydown); trigger.current?.focus(); };
  }, [open]);
  return <>
    <nav className={`${styles.nav} ${tone === "dark" ? styles.dark : ""}`} aria-label="Основная навигация">
      <Link href="/" className={styles.brand}><MoonCat mark/><span>aurora’s room</span></Link>
      <div className={styles.actions}><a className={styles.write} href={telegram} target="_blank" rel="noreferrer">Написать ↗</a><button ref={trigger} className={styles.menuButton} type="button" aria-label="Открыть меню" aria-expanded={open} aria-controls="aurora-menu" onClick={() => setOpen(true)}><span>Меню</span><i aria-hidden="true"><b/><b/></i></button></div>
    </nav>
    {mounted && createPortal(<div className={`${styles.overlay} ${open ? styles.open : ""}`} aria-hidden={!open} inert={!open}>
      <button className={styles.backdrop} tabIndex={-1} aria-label="Закрыть навигацию" onClick={() => setOpen(false)}/>
      <div ref={panel} className={styles.panel} role="dialog" aria-modal={open} aria-label="Навигация по сайту" id="aurora-menu">
        <div className={styles.panelHeader}><Link href="/" className={styles.menuBrand} onClick={() => setOpen(false)}>aurora’s room</Link><button ref={close} className={styles.close} aria-label="Закрыть меню" onClick={() => setOpen(false)}><span>Закрыть</span><i aria-hidden="true">×</i></button></div>
        <div className={styles.panelBody}><div className={styles.intro}><span>МАЛЕНЬКАЯ ВСЕЛЕННАЯ АВРОРЫ</span><h2>Куда <em>заглянем?</em></h2></div><div className={styles.links}>{items.map(([n,title,href], i) => <Link key={href} href={href} style={{ "--menu-delay": `${i * 55}ms` } as React.CSSProperties} onClick={() => setOpen(false)}><small>{n}</small><b>{title}</b><span aria-hidden="true">↗</span></Link>)}</div><Link className={styles.club} href="/club" onClick={() => setOpen(false)}>Закрытое пространство Авроры ↗</Link></div>
        <div className={styles.menuEnd}><CloudBank className={styles.menuCloudBack}/><CloudBank className={styles.menuCloud}/><div className={styles.menuCat}><MoonCat sleepy/></div><a href={channel} target="_blank" rel="noreferrer">Жизнь между раскладами<br/><span>в Telegram ↗</span></a></div>
      </div>
    </div>, document.body)}
  </>;
}
