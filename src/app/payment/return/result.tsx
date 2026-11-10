"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { planetNames, zodiac } from "../../../lib/natal/core";
import type { Reading } from "../../../lib/astro/calculate";
import { WorldMap } from "./world-map";
function ChartWheel({ report }: { report: Reading }) {
  const point = (angle: number, radius: number) => ({ x: 180 + radius * Math.cos((angle - 90) * Math.PI / 180), y: 180 + radius * Math.sin((angle - 90) * Math.PI / 180) });
  return <svg viewBox="0 0 360 360" role="img" aria-label="Рассчитанная натальная карта: планеты и дома Плацидуса" className="realChart"><circle cx="180" cy="180" r="168" fill="none" stroke="currentColor"/><circle cx="180" cy="180" r="130" fill="none" stroke="currentColor" opacity=".3"/>{report.cusps.map((c, i) => { const a = point(c, 130), b = point(c, 65), label = point(c + 8, 98); return <g key={i}><line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="currentColor" opacity=".25"/><text x={label.x} y={label.y} fontSize="10" textAnchor="middle">{i + 1}</text></g>; })}{zodiac.map((sign, i) => { const p = point(i * 30 + 15, 149); return <text key={sign} x={p.x} y={p.y} fontSize="9" textAnchor="middle">{sign}</text>; })}{report.chart.placements.map(p => { const dot = point(p.longitude, 126); return <circle key={p.planet} cx={dot.x} cy={dot.y} r="4" fill="currentColor"><title>{planetNames[p.planet]} — {p.longitude.toFixed(2)}°</title></circle>; })}<text x="180" y="184" fontSize="21" textAnchor="middle">aurora</text></svg>;
}
export function PaymentResult() {
  const [report, setReport] = useState<Reading | null>(null), [message, setMessage] = useState("Проверяем тестовый платёж…"), [pending, setPending] = useState(false), [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true, timer: ReturnType<typeof setTimeout> | undefined, tries = 0;
    const id = new URLSearchParams(window.location.search).get("order");
    if (!id) { setMessage("В ссылке нет номера заказа. Начните с формы расчёта."); return; }
    async function load() {
      try {
        const response = await fetch(`/api/checkout?order=${encodeURIComponent(id!)}`, { cache: "no-store" });
        const value = await response.json(); if (!active) return;
        if (!response.ok) { setMessage(value.message || "Не удалось проверить заказ."); setPending(false); return; }
        if (value.status === "ready" && value.report) { setReport(value.report); setMessage("Тестовый платёж подтверждён сервером. Ваш разбор готов."); setPending(false); return; }
        if (["canceled", "refunded"].includes(value.status)) { setMessage("Платёж отменён или возвращён. Результат не выдаётся."); setPending(false); return; }
        setMessage("Оплата пока не подтверждена. Если вы отменили её, деньги не списывались. Можно вернуться к форме."); setPending(true);
        if (++tries < 8) timer = setTimeout(load, 3000);
      } catch { if (active) { setMessage("Нет соединения. Заказ сохранён — повторите проверку."); setPending(false); } }
    }
    load(); return () => { active = false; if (timer) clearTimeout(timer); };
  }, [retry]);
  return <section className="shell astroSection readingResult"><span className="astroBadge">ТЕСТОВАЯ ЮKASSA · БЕЗ РЕАЛЬНЫХ СПИСАНИЙ</span><h1 className="astroTitle">{report?.title || "Ваш разбор"}</h1><p role="status" aria-live="polite">{message}</p>{!report ? <div className="astroLinks"><button className="button natalSubmit" onClick={() => setRetry(v => v + 1)}>{pending ? "Проверить ещё раз" : "Повторить проверку"}</button><Link href="/natal" className="textLink">Вернуться к форме</Link></div> : <>
    <p>{report.birthplace}{report.destination && ` → ${report.destination.name}`}</p><p className="readingMethod">{report.engine}<br/>{report.editorial}</p>
    <button className="button natalPrint" onClick={() => window.print()}>Сохранить в PDF / напечатать</button><p className="readingMethod">В диалоге печати выберите «Сохранить как PDF». Доступ к этому заказу — в текущем браузере 7 дней.</p>
    {report.product === "natal" ? <ChartWheel report={report}/> : <WorldMap report={report}/>}
    <div className="astroExpress">{report.sections.map(section => <article key={section.id}><h2>{section.title}</h2><p>{section.text}</p></article>)}</div>
    <details className="readingFacts"><summary>Положения планет и дома</summary><div className="readingTableWrap"><table><thead><tr><th>Планета</th><th>Знак и градус</th><th>Дом</th>{report.relocated && <th>В новом городе</th>}</tr></thead><tbody>{report.chart.placements.map(p => <tr key={p.planet}><td>{planetNames[p.planet]}{p.retrograde ? " ℞" : ""}</td><td>{zodiac[Math.floor(p.longitude / 30)]} {(p.longitude % 30).toFixed(2)}°</td><td>{p.house}</td>{report.relocated && <td>{report.relocated.chart.placements.find(q => q.planet === p.planet)?.house}</td>}</tr>)}</tbody></table></div></details>
    <p className="astroNotice">Астрология — символическая практика, её трактовки не являются научно подтверждённым прогнозом. Решения о здоровье, деньгах и переезде принимайте с опорой на проверяемые обстоятельства.</p><Link href="/personal" className="textLink">Обсудить лично с Авророй ↗</Link>
  </>}</section>;
}
