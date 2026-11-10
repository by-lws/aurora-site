import { MoonCat, CloudBank } from "../components/aurora-art";
import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";
import { MobileCta } from "../components/mobile-cta";
import { telegram } from "../content";

export const metadata: Metadata = {
  title: "Индивидуальное обучение Таро",
  description: "Индивидуальное обучение Таро с Авророй: связки карт, практика раскладов, работа с клиентом и старт в профессии.",
};

const modules = [
  ["База без зубрёжки", "Арканы как система, логика колоды и способы читать карту в контексте вопроса."],
  ["Связки и история", "Как перестать трактовать каждую карту отдельно и видеть ситуацию целиком."],
  ["Практика с клиентом", "Вопросы, границы, сложные реакции, этика и уверенная подача разбора."],
  ["Из знания — в навык", "Первые клиенты, позиционирование, стоимость и спокойный старт без самозванца внутри."],
];

const doubts = ["«А вдруг я не смогу?»", "«Где брать клиентов?»", "«У меня нет способностей»", "«Я путаюсь в значениях»"];

export default function TrainingPage() {
  return (
    <main className="innerPage trainingPage">
      <section className="trainingHero">
        <SiteHeader tone="dark" />
        <div className="shell trainingHeroGrid">
          <div className="trainingTitle"><p className="eyebrow dark">individual tarot study</p><h1>Не выучить<br />78 значений.<br /><em>Научиться видеть.</em></h1><p>Индивидуальное обучение Таро с Авророй — под твой темп, вопросы, страхи и цель: от раскладов себе до работы с клиентами.</p><a className="button buttonInk" href={telegram} target="_blank" rel="noreferrer">получить программу <span>→</span></a></div>
          <div className="trainingDeck" aria-hidden="true"><div className="deckCard dOne">THE FOOL<br /><b>0</b></div><div className="deckCard dTwo">THE STAR<br /><b>XVII</b></div><div className="deckCard dThree">YOU<br /><b>∞</b></div><span className="deckCat"><MoonCat className="legacyMonoCat"/><small>тоже<br />учится</small></span></div>
        </div>
        <div className="marquee trainingMarquee"><div>SEPTEMBER IS FOR STUDYING ✦ SEE THE CONNECTIONS ✦ TRUST YOUR READING ✦ SEPTEMBER IS FOR STUDYING ✦</div></div>
      </section>

      <section className="doubtSection"><div className="shell doubtGrid" data-aurora-reveal><div><p className="eyebrow dark">узнаёшь себя?</p><h2>Обычно приходят<br />вот с этим</h2></div><div className="doubtCloud">{doubts.map((doubt, i) => <span key={doubt} style={{ "--i": i } as React.CSSProperties}>{doubt}</span>)}<b aria-hidden="true"><CloudBank className="legacyCloud"/></b></div><div className="doubtAnswer"><span>а уходят с:</span><p>«Я вижу связки, уверенно делаю расклады, понимаю клиента — и мне за это платят»</p></div></div></section>

      <section className="programSection">
        <div className="shell" data-aurora-reveal><p className="eyebrow">программа маршрута</p><div className="sectionHeading light"><h2>Четыре точки<br />твоего роста</h2><span className="catBadge lightBadge">без гонки и сравнения</span></div><div className="moduleGrid">{modules.map(([title, text], i) => <article key={title}><span>0{i + 1}</span><div className="moduleIcon" aria-hidden="true">{["☾", "✦", "♡", "↗"][i]}</div><h3>{title}</h3><p>{text}</p></article>)}</div></div>
      </section>

      <section className="individualSection"><div className="shell individualGrid" data-aurora-reveal><div className="individualTicket"><div className="ticketHead"><span>AURORA ACADEMY</span><b>PRIVATE / 1:1</b></div><h3>Твой личный<br />посадочный</h3><dl><div><dt>FORMAT</dt><dd>индивидуально</dd></div><div><dt>TEMPO</dt><dd>твой собственный</dd></div><div><dt>FEEDBACK</dt><dd>личная</dd></div><div><dt>PAYMENT</dt><dd>есть рассрочка</dd></div></dl><div className="ticketCode">LEARN • PRACTICE • TRUST • GROW</div></div><div className="individualCopy"><p className="eyebrow dark">почему индивидуально</p><h2>Потому что твой<br /><em>затык — только твой</em></h2><p>Кому-то сложно запомнить систему, кому-то — говорить с клиентом, а кто-то всё понимает, но боится назвать цену. На личном обучении не нужно ждать, пока группа дойдёт до твоего вопроса.</p><ul><li>занятия и задания под текущий уровень</li><li>разбор ошибок без стыда и сравнения</li><li>практика до ощущения «я могу»</li><li>поддержка в первых профессиональных шагах</li></ul></div></div></section>

      <section className="outcomeSection"><div className="shell" data-aurora-reveal><p className="eyebrow dark">после обучения</p><h2>Ты не просто знаешь карты.<br /><em>Ты умеешь ими пользоваться.</em></h2><div className="outcomeGrid"><span>видишь связки</span><span>держишь структуру расклада</span><span>говоришь уверенно</span><span>работаешь с запросом</span><span>понимаешь границы</span><span>готова брать клиентов</span></div><div className="outcomeCat" aria-hidden="true"><MoonCat className="legacyMonoCat"/><small>диплом<br />одобряю</small></div></div></section>

      <section className="trainingFaq"><div className="shell trainingFaqGrid" data-aurora-reveal><div><p className="eyebrow">коротко о важном</p><h2>Перед тем,<br />как начать</h2></div><div><details open><summary>Подойдёт ли обучение с нуля?<b>+</b></summary><p>Да. Программа и темп подстраиваются под твою базу и цель.</p></details><details><summary>Можно ли потом работать с клиентами?<b>+</b></summary><p>Да, если это твоя цель. Отдельно разбираются общение, этика, практика и старт.</p></details><details><summary>Есть ли рассрочка?<b>+</b></summary><p>В канале указано, что доступны разные тарифы и рассрочка. Актуальные условия Аврора пришлёт в личные сообщения.</p></details></div></div></section>

      <section className="compactCta compactCtaYellow"><div className="shell" data-aurora-reveal><p className="eyebrow dark">твоё место за столом</p><h2>Напиши «ОБУЧЕНИЕ»<br /><em>и получи программу.</em></h2><a className="button buttonInk" href={telegram} target="_blank" rel="noreferrer">написать Авроре <span>→</span></a><Link className="managerLink" href="/services">сначала посмотреть услуги →</Link><div className="compactCat" aria-hidden="true"><MoonCat className="legacyMonoCat"/></div></div></section>
      <SiteFooter />
      <MobileCta label="получить программу" />
    </main>
  );
}
