import { MoonCat, CloudBank } from "../components/aurora-art";
import type { Metadata } from "next";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";
import { MobileCta } from "../components/mobile-cta";
import { telegram } from "../content";

export const metadata: Metadata = {
  title: "Aurora’s space — закрытый клуб",
  description: "Закрытое пространство Авроры: практики, медитации, расклады, задания, поддержка и скидки за 888 ₽ в месяц.",
};

const inside = [
  ["Практики", "Инструменты, которые помогают не только понять, но и прожить тему месяца."],
  ["Медитации", "Спокойные паузы для контакта с собой, телом и собственными желаниями."],
  ["Расклады", "Подсказки на месяц и работа с личными вопросами участниц пространства."],
  ["Задания", "Маленькие действия, из которых постепенно собираются большие изменения."],
  ["Общение", "Небольшой круг, больше внимания Авроры и поддержка без соревнования."],
  ["Плюшки", "Скидки на индивидуальную работу и дополнительные материалы внутри клуба."],
];

export default function ClubPage() {
  return (
    <main className="innerPage clubPage">
      <section className="clubHero">
        <SiteHeader tone="dark" />
        <CloudBank className="clubHeroCloud cloudLeft legacyCloud"/><CloudBank className="clubHeroCloud cloudRight legacyCloud"/>
        <div className="shell clubHeroInner">
          <p className="eyebrow dark">aurora’s space • private club</p>
          <h1>Место, где<br />можно перестать<br /><em>убегать от себя</em></h1>
          <p>Практики, медитации, Таро и живое общение — чтобы изменения не оставались красивой мыслью в заметках.</p>
          <div className="clubHeroActions"><a className="button buttonInk" href={telegram} target="_blank" rel="noreferrer">хочу в пространство <span>→</span></a><div><b>888 ₽</b><span>/ месяц<br />цена из канала</span></div></div>
          <div className="clubHeroCat" aria-hidden="true"><MoonCat className="legacyMonoCat"/><small>место<br />занято</small></div>
        </div>
        <div className="marquee clubMarquee"><div>RETURN TO YOURSELF ✦ WARM SPACE ✦ LITTLE STEPS ✦ BIG CHANGES ✦ RETURN TO YOURSELF ✦</div></div>
      </section>

      <section className="clubManifesto"><div className="shell manifestoGrid" data-aurora-reveal><div><p className="eyebrow dark">не ещё один марафон</p><h2>Здесь не нужно<br />становиться<br /><em>«идеальной»</em></h2></div><div><p className="bigParagraph">Нужно только разрешить себе быть в контакте — с желаниями, страхами, деньгами, телом и своей настоящей жизнью.</p><p>В канале Аврора называет первый месяц клуба «возвращением к себе». Пространство маленькое и личное: каждая получает внимание, а темы не остаются абстрактной теорией.</p><div className="manifestoSticker">никакой гонки<br />только путь ♡</div></div></div></section>

      <section className="insideSection"><div className="shell" data-aurora-reveal><p className="eyebrow">что внутри</p><div className="sectionHeading light"><h2>Твой набор<br />для возвращения</h2><span className="catBadge lightBadge">6 вещей + свои люди</span></div><div className="insideGrid">{inside.map(([title, text], i) => <article key={title}><span>0{i + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>

      <section className="monthSection"><div className="shell monthGrid" data-aurora-reveal><div className="monthCalendar"><div className="calendarHead"><span>AURORA’S SPACE</span><b>MONTH / 01</b></div><div className="calendarTitle">ВОЗВРАЩЕНИЕ<br />К СЕБЕ</div><div className="calendarDays">{["ПН","ВТ","СР","ЧТ","ПТ","СБ","ВС"].map((d) => <span key={d}>{d}</span>)}</div><div className="calendarCode">PRACTICE • FEEL • CHOOSE • LIVE</div></div><div className="monthCopy"><p className="eyebrow dark">как выглядит месяц</p><h2>Одна тема.<br /><em>Много способов<br />прожить её.</em></h2><ol><li><span>01</span><b>Вход в тему</b><p>Разбираемся, где ты сейчас и чего на самом деле хочешь.</p></li><li><span>02</span><b>Практика</b><p>Получаешь инструменты, задания и поддержку в процессе.</p></li><li><span>03</span><b>Личный слой</b><p>Добавляем расклады и вопросы, которые важны именно тебе.</p></li><li><span>04</span><b>Итоги</b><p>Замечаем изменения и выбираем, что забираем дальше.</p></li></ol></div></div></section>

      <section className="clubForSection"><div className="shell" data-aurora-reveal><p className="eyebrow dark">тебе подойдёт, если</p><h2>Ты хочешь не просто знать.<br /><em>Ты хочешь менять.</em></h2><div className="clubForGrid"><span>устала всё делать одна</span><span>любишь мягкий темп</span><span>хочешь регулярности</span><span>ценишь живое общение</span><span>интересуешься Таро</span><span>готова пробовать</span></div><div className="clubForCat" aria-hidden="true"><MoonCat className="legacyMonoCat"/><small>да, тебе<br />сюда</small></div></div></section>

      <section className="clubTicketSection"><div className="shell clubTicketPage" data-aurora-reveal><div className="ticketHead"><span>AURORA AIRWAYS / PRIVATE SPACE</span><b>MEMBERSHIP</b></div><div><p className="eyebrow dark">посадка открыта</p><h2>Твой билет<br /><em>обратно к себе</em></h2><p>Вступить можно в любой момент. Напиши Авроре «ХОЧУ В ПРОСТРАНСТВО» — она пришлёт актуальные условия и расскажет, что происходит в клубе сейчас.</p></div><div className="ticketPrice"><b>888</b><span>RUB / MONTH</span><i><CloudBank className="legacyCloud"/></i></div><a className="button buttonInk" href={telegram} target="_blank" rel="noreferrer">забрать билет <span>→</span></a><div className="ticketCode">AURORA • HOME • AURORA • HOME • AURORA</div></div></section>

      <SiteFooter />
      <MobileCta label="вступить в клуб" />
    </main>
  );
}
