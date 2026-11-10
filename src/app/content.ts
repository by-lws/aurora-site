export const telegram = "https://t.me/merensetaur";
export const channel = "https://t.me/bymerenset8";
export const manager = "https://t.me/arinawithlove7";

export const services = [
  {
    number: "01",
    code: "ARCANA / ONE WAY",
    slug: "tarot",
    title: "Расклады Таро",
    text: "Чтобы увидеть ситуацию целиком, перестать гадать и понять, какой шаг сейчас твой.",
    items: ["отношения и чувства", "деньги и реализация", "выбор и жизненный путь"],
    meta: "актуальный прайс — в личных сообщениях",
    color: "blue",
  },
  {
    number: "02",
    code: "MOON / SPECIAL DATE",
    slug: "rituals",
    title: "Ритуалы и обряды",
    text: "Работа с намерением и энергией на специально подобранные даты. Формат выбирается после консультации.",
    items: ["изобилие и успех", "любовь и отношения", "очищение и защита"],
    meta: "запись на ближайшую рабочую дату",
    color: "pink",
  },
  {
    number: "03",
    code: "AURORA’S SPACE",
    slug: "club",
    title: "Закрытый клуб",
    text: "Тёплое пространство для тех, кто хочет возвращаться к себе не в одиночку.",
    items: ["практики и медитации", "расклады и домашние задания", "скидки и больше общения"],
    meta: "888 ₽ / месяц",
    color: "yellow",
  },
  {
    number: "04",
    code: "STUDY / PRIVATE",
    slug: "training",
    title: "Обучение Таро",
    text: "Индивидуально и в твоём темпе: от первых связок карт до уверенной работы с клиентом.",
    items: ["личная обратная связь", "практика на реальных запросах", "старт и продвижение"],
    meta: "есть разные тарифы и рассрочка",
    color: "cream",
  },
] as const;
