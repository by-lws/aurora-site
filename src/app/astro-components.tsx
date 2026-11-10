"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {initialCatalog,validateCatalog,formatPrice,statusNames,type Product} from "../lib/astro/catalog";
import catalogStyles from "./readings.module.css";
export const catalogKey="aurora-catalog-tz2-preview";
export function useCatalog(){
  const [catalog,setCatalog]=useState<Product[]>(initialCatalog);
  useEffect(()=>{const read=()=>{try{const raw=localStorage.getItem(catalogKey);setCatalog(raw?validateCatalog(JSON.parse(raw)):initialCatalog);}catch{setCatalog(initialCatalog);}};read();window.addEventListener("storage",read);window.addEventListener("aurora-catalog",read);return()=>{window.removeEventListener("storage",read);window.removeEventListener("aurora-catalog",read);};},[]);
  return catalog;
}
export function AutomaticLinks(){
  const catalog=useCatalog();
  const natal=catalog.find(p=>p.id==="natal")!;
  const relocation=catalog.find(p=>p.id==="relocation")!;
  return <><div className="astroLinks">{natal.status==="open"&&<Link className="button buttonPrimary" href="/natal">Натальная карта — {formatPrice(natal)}</Link>}<Link className="button astroOutline" href="/personal">Личные разборы с Авророй</Link></div>{relocation.status==="open"&&<Link className="textLink" href="/relocation">Релокация: один город — {formatPrice(relocation)} →</Link>}</>;
}
export function CatalogCards({kind}:{kind:"automatic"|"personal"}){
  const local=useCatalog();
  const catalog=kind==="automatic"?initialCatalog:local;
  return <div className={catalogStyles.cards}>{catalog.filter(p=>p.kind===kind&&p.status!=="hidden").map((p,index)=><article className={catalogStyles.card} key={p.id} data-aurora-reveal>
    <div className={catalogStyles.cardTop}><span>{p.status==="soon"?"Готовим новый формат":kind==="automatic"?"Автоматический разбор":"Лично · по записи"}</span><i aria-hidden="true">{String(index+1).padStart(2,"0")}</i></div><h3>{p.id==="natal"?"Натальная карта (экспрес)":p.title}</h3><p>{p.intro}</p><details><summary>Что внутри</summary><ul>{p.includes.map(s=><li key={s}>{s}</li>)}</ul></details>
    <div className={catalogStyles.cardFooter}><strong>{formatPrice(p)}</strong><small>{kind==="automatic"?"Тестовая оплата · без списаний":p.status==="open"?"Стоимость уточним при записи":statusNames[p.status]}</small><Link href={kind==="automatic"?`/${p.id}`:`/personal/${p.id}`} aria-label={`Подробнее: ${p.title}`}>{kind==="automatic"?"Открыть разбор":p.status==="open"?"Записаться":"Подробнее"}<span aria-hidden="true">↗</span></Link></div>
  </article>)}</div>;
}
export function PersonalDetails({id}:{id:string}){
  const p=useCatalog().find(p=>p.id===id)!;
  if(p.status==="hidden")return <section className="shell astroSection"><h1>Услуга сейчас недоступна</h1><Link href="/personal">Вернуться в каталог</Link></section>;
  return <section className="shell astroSection"><span className="astroBadge">Лично с Авророй • по записи</span><h1 className="astroTitle">{p.title}</h1><p className="astroLead">{p.intro}</p><p><strong>{formatPrice(p)}</strong> · {statusNames[p.status]}</p>{p.priceNote&&<p className="astroNotice">Окончательную стоимость уточним при записи.</p>}<div className="astroDetailGrid"><article><h2>Кому подойдёт</h2><p>{p.audience}</p><h2>Что рассматривается</h2><ul>{p.includes.map(s=><li key={s}>{s}</li>)}</ul><h2>Как проходит запись</h2><p>Вы описываете вопрос. Аврора уточняет формат, объём, срок и оплату лично. Эта страница не запускает расчёт и не принимает онлайн-предоплату.</p>{id==="solar"&&<p>Соляр — карта ежегодного возвращения Солнца к натальному положению. Нужно уточнить планируемое место дня рождения.</p>}{id==="compatibility"&&<p>Синастрия сопоставляет две натальные карты. Матрица пары — отдельная методика, пока не доступная для заказа. При неизвестном времени часть выводов недоступна.</p>}{id==="matrix"&&<p>Матрица судьбы опирается на дату рождения и систему арканов, а не положения планет. Формат ещё готовится. О старте можно узнать у Авроры.</p>}</article><RequestDraft product={p}/></div></section>;
}
function RequestDraft({product:p}:{product:Product}){
  const [draft,setDraft]=useState("");const [copied,setCopied]=useState(false);
  if(p.status!=="open")return <aside className="astroCard"><h2>{statusNames[p.status]}</h2><p>Формат ещё не открыт для записи. Можно задать вопрос без покупки и расчёта.</p><a className="button natalSubmit" href="https://t.me/merensetaur" target="_blank" rel="noreferrer">Задать вопрос перед записью</a></aside>;
  function prepare(e:React.FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget);const lines=[`Личная услуга: ${p.title}`,`Имя: ${f.get("name")}`,`Контакт: ${f.get("contact")}`,`Вопрос: ${f.get("question")}`];if(p.id==="compatibility")lines.push(`Метод: ${f.get("method")}`,`Первый человек: ${f.get("person1")}`,`Второй человек: ${f.get("person2")}`);else lines.push(`Данные рождения: ${f.get("birth")}`);if(p.id==="solar")lines.push(`Место дня рождения: ${f.get("birthdayPlace")}`);if(p.id==="personal-relocation")lines.push(`Города для консультации: ${f.get("cities")}`);setDraft(lines.join("\n"));setCopied(false);}
  return <aside className="astroCard"><h2>Записаться к Авроре</h2><p>Пока сервер заявок не подключён, анкета подготовит текст для личного сообщения. Она не отправляет и не сохраняет ваши данные.</p>
    <form className="astroForm" onSubmit={prepare}>
      <label>Имя<input name="name" required maxLength={100}/></label><label>Telegram или email<input name="contact" required maxLength={150}/></label><label>Ваш вопрос<textarea name="question" required maxLength={2000}/></label>
      {p.id==="compatibility"&&<>
        <label>Метод<select name="method" defaultValue="synastry"><option value="synastry">Синастрия — две натальные карты</option><option value="matrix" disabled>Матрица пары — метод ещё не утверждён</option></select></label>
        <label>Данные первого человека<textarea name="person1" required maxLength={500} placeholder="Дата, место, время рождения или «время неизвестно»"/></label><label>Данные второго человека<textarea name="person2" required maxLength={500} placeholder="Дата, место, время рождения или «время неизвестно»"/></label>
      </>}
      {p.id!=="compatibility"&&<label>Ваши данные рождения<textarea name="birth" required maxLength={500} placeholder="Дата, место, время рождения или «время неизвестно»"/></label>}
      {p.id==="personal-relocation"&&<label>До трёх городов для личной консультации<textarea name="cities" required maxLength={500}/></label>}
      {p.id==="solar"&&<label>Где планируете встретить день рождения<input name="birthdayPlace" required maxLength={150}/></label>}
      <label className="natalCheck"><input type="checkbox" required/>Разрешаю использовать данные для обращения. Для данных другого человека у меня есть его разрешение.</label><button className="button natalSubmit">Подготовить заявку</button>
    </form>
    {draft&&<div className="astroDraft"><p role="status">Заявка подготовлена, но ещё не отправлена.</p><pre>{draft}</pre><button className="button natalSubmit" onClick={async()=>{try{await navigator.clipboard.writeText(draft);setCopied(true);}catch{setCopied(false);}}}>{copied?"Скопировано":"Скопировать заявку"}</button><a className="textLink" href="https://t.me/merensetaur" target="_blank" rel="noreferrer">Открыть Telegram Авроры ↗</a></div>}
  </aside>;
}
