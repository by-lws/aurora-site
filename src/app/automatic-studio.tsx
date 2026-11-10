"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { initialCatalog, formatPrice } from "../lib/astro/catalog";
import { places } from "../lib/natal/core";
import "./checkout.css";
export function AutomaticStudio({ id }: { id: "natal" | "relocation" }) {
  const product = initialCatalog.find(p => p.id === id)!;
  const [busy, setBusy] = useState(false), [message, setMessage] = useState("");
  const attempt = useRef<string | null>(null);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return;
    const form = new FormData(event.currentTarget);
    setBusy(true); setMessage("Проверяем данные и создаём тестовый заказ…");
    try {
      const ready = await fetch("/api/checkout", { cache: "no-store" });
      if (!ready.ok) throw Error((await ready.json()).message || "Тестовая касса недоступна.");
      attempt.current ||= crypto.randomUUID();
      const response = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": attempt.current }, body: JSON.stringify({ product: id, birth: { date: form.get("date"), time: form.get("time"), placeId: form.get("place"), consent: form.get("consent") === "on" }, destination: form.get("destination"), testConsent: form.get("consent") === "on" }) });
      const result = await response.json();
      if (!response.ok) throw Error(result.message || "Не удалось создать заказ.");
      if (result.confirmationUrl) window.location.assign(result.confirmationUrl);
      else window.location.assign(`/payment/return?order=${result.id}`);
    } catch (e) { setMessage(e instanceof Error ? e.message : "Ошибка соединения. Можно повторить: заказ не дублируется."); setBusy(false); }
  }
  return <section className="shell astroSection checkoutIntro">
    <span className="astroBadge">ТЕСТОВАЯ ВЕРСИЯ · БЕЗ СПИСАНИЙ</span>
    <h1 className="astroTitle">{id === "natal" ? "Натальная карта (экспрес)" : "Релокация и карта мира"}</h1>
    <p className="astroLead">{id === "natal" ? "Карта рождения и шесть коротких глав о себе." : "Один новый город, ваша карта и планетарные линии на карте мира."}</p>
    <div className="astroDetailGrid"><article><h2>Ваш разбор</h2><ul>{product.includes.map(s => <li key={s}>{s}</li>)}</ul><p>{id === "natal" ? "Солнце, Луна, ASC, планеты, дома и аспекты рассчитаны по дате, времени и месту рождения." : "Момент рождения остаётся прежним. Пересчитываются дома и углы нового города; карта мира показывает линии AC/DC/MC/IC."}</p><p>Астрологические трактовки — символический способ самоисследования. Это автоматический текст сайта, не личная консультация Авроры.</p><p className="astroNotice">Сейчас проверяем сервис: используйте вымышленные данные и только тестовую карту ЮKassa. Настоящие деньги не списываются. Сумма в кассе: {formatPrice(product)}.</p><Link href="/personal" className="textLink">Лично с Авророй ↗</Link></article>
    <form className="astroCard astroForm" onSubmit={submit} onChange={() => { attempt.current = null; setMessage(""); }}>
      <h2>Данные для теста</h2>
      <label>Дата рождения<input name="date" type="date" required min="1970-01-01" max={new Date().toISOString().slice(0, 10)} disabled={busy}/></label>
      <label>Местное время рождения<input name="time" type="time" required disabled={busy}/></label>
      <label>Место рождения<select name="place" required defaultValue="" disabled={busy}><option value="" disabled>Выберите город</option>{places.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
      {id === "relocation" && <label>Город назначения<select name="destination" required defaultValue="" disabled={busy}><option value="" disabled>Выберите город</option>{places.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>}
      <small>Пока доступны восемь городов и даты с 1970 года. Без точного времени автоматический заказ не создаётся.</small>
      <label className="natalCheck"><input name="consent" type="checkbox" required disabled={busy}/>Использую вымышленные данные и разрешаю их обработку сервером сайта и хранение расчёта в Neon (США). Доступ к результату — в этом браузере 7 дней. В ЮKassa передаются только номер заказа, услуга и сумма.</label>
      <p><Link href="/privacy">Об обработке данных</Link> · <Link href="/terms">Условия тестирования</Link></p>
      <button className="button natalSubmit" disabled={busy} type="submit">{busy ? "Создаём заказ…" : `Тестовая оплата · ${formatPrice(product)}`}</button>
      <p role="status" aria-live="polite" className="natalFeedback">{message}</p>
    </form></div>
  </section>;
}
