export type Availability = "open" | "soon" | "unavailable" | "hidden";
export type Product = { id: string; kind: "automatic" | "personal"; title: string; price: number | null; status: Availability; intro: string; audience: string; includes: string[]; priceNote?: string };
export const initialCatalog: Product[] = [
  {id:"natal",kind:"automatic",title:"Натальная карта (экспрес)",price:800,status:"open",intro:"Компактный автоматический разбор карты рождения в шести смысловых разделах.",audience:"Хочется познакомиться с основными темами карты, без длинной индивидуальной консультации.",includes:["Круг карты и ключевые положения","Личность, эмоции, отношения, таланты и ресурсы","Закрытая страница результата на 7 дней и сохранение через печать в PDF"]},
  {id:"relocation",kind:"automatic",title:"Релокация — один город",price:1500,status:"open",intro:"Посмотрите, как меняются дома и углы вашей карты в одном выбранном городе.",audience:"Есть конкретный город и достаточно точное время рождения.",includes:["Карта мира с линиями AC/DC/MC/IC","Различия по домам и углам","Краткий разбор нового города и печать в PDF"]},
  {id:"one-topic",kind:"personal",title:"Разбор одной сферы жизни",price:4500,status:"open",priceNote:"Предварительно: 4 500 ₽. Нужно подтвердить, не имелось ли в виду 3 333 ₽.",intro:"Одна важная тема: отношения, деньги, карьера, самореализация или переезд.",audience:"Есть конкретный вопрос, которому хочется уделить внимание.",includes:["Уточнение запроса с Авророй","Индивидуальный анализ выбранной темы","Формат и срок согласуются лично"]},
  {id:"full-natal",kind:"personal",title:"Полный разбор натальной карты",price:8500,status:"open",intro:"Связный персональный разбор натала с учётом вашей ситуации и вопросов.",audience:"Нужен глубокий разговор о себе, а не автоматический экспресс-отчёт.",includes:["Личность, чувства и отношения","Карьерные интересы и личные вопросы","Формат, объём и срок согласуются лично"]},
  {id:"compatibility",kind:"personal",title:"Совместимость пары",price:6000,status:"open",intro:"Как ваши потребности и способы общения проявляются рядом друг с другом?",audience:"Хочется исследовать взаимодействие двух людей без вердикта «подходите / не подходите».",includes:["Личная синастрия двух натальных карт","Межпланетные аспекты и особенности взаимодействия","Матрица пары — только после утверждения метода"]},
  {id:"solar",kind:"personal",title:"Ваш личный соляр на год",price:12222,status:"open",intro:"Новый личный год — повод посмотреть на свои цели по-новому. Аврора лично связывает соляр с вашей натальной картой.",audience:"Хочется обсудить темы нового личного года и планируемое место дня рождения.",includes:["Личная работа Авроры с солярной и натальной картами","Отношения, работа, перемены и точки внимания","Формат и сроки согласуются при записи"]},
  {id:"personal-relocation",kind:"personal",title:"Личная релокация — до 3 городов",price:3999,status:"open",intro:"Вместе изучите до трёх вариантов для жизни, обучения или развития с учётом вашего запроса.",audience:"Нужен разговор о нескольких городах и личной ситуации.",includes:["До трёх выбранных городов","Индивидуальный вопрос клиента","Ручная консультация, не автоматическая подборка стран"]},
  {id:"matrix",kind:"personal",title:"Матрица судьбы — лично",price:3000,status:"soon",intro:"Символический разбор по дате рождения и выбранной системе арканов Таро. Не натальная карта и не астрономия.",audience:"Интересен нумерологический подход к самоисследованию.",includes:["Методика ещё требует утверждения","Содержание и трактовки будут согласованы","Публичный калькулятор не предусмотрен"]},
  {id:"vip",kind:"personal",title:"Комплексный VIP-разбор",price:null,status:"soon",intro:"Индивидуальный комплексный формат. Состав и стоимость ещё согласуются.",audience:"Нужно обсудить несколько направлений личной работы.",includes:["Объём и позиционирование будут утверждены","Стоимость уточняется","Без опубликованной числовой цены"]},
];
export const statusNames: Record<Availability,string> = {open:"Запись открыта",soon:"Скоро",unavailable:"Временно недоступна",hidden:"Скрыта"};
export const formatPrice = (p: Product) => p.price === null ? "Стоимость уточняется" : `${p.price.toLocaleString("ru-RU")} ₽`;
export function validateCatalog(value: unknown): Product[] {
  if (!Array.isArray(value) || value.length !== initialCatalog.length) throw new Error("Каталог должен содержать два автоматических и семь личных продуктов.");
  const ids=new Set<string>();
  for (const p of value) {
    const seed=initialCatalog.find(s=>s.id===p?.id);
    if (!seed || ids.has(p.id) || p.kind!==seed.kind || !Object.hasOwn(statusNames,p.status) || typeof p.title!=="string" || !p.title.trim() || p.title.length>150 || typeof p.intro!=="string" || !p.intro.trim() || p.intro.length>1500 || typeof p.audience!=="string" || !Array.isArray(p.includes) || p.includes.length<1 || p.includes.some((s:unknown)=>typeof s!=="string"||!s||s.length>500) || (p.price!==null && (!Number.isSafeInteger(p.price)||p.price<=0||p.price>1000000))) throw new Error("Некорректные данные каталога.");
    if ((p.kind==="automatic" && p.price===null) || (p.id==="vip" && p.price!==null)) throw new Error("Автоматический продукт требует цену; цена VIP ещё не утверждена.");
    ids.add(p.id);
  }
  return value;
}
export function quoteAutomatic(catalog:Product[],id:string) {
  validateCatalog(catalog);
  const p=catalog.find(s=>s.id===id);
  if (!p || p.kind!=="automatic" || p.status!=="open" || p.price===null) throw new Error("Эта услуга не продаётся автоматически.");
  return {productId:p.id,amountMinor:p.price*100,currency:"RUB" as const};
}
