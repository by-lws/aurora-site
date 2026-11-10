export const zodiac = ["Овен", "Телец", "Близнецы", "Рак", "Лев", "Дева", "Весы", "Скорпион", "Стрелец", "Козерог", "Водолей", "Рыбы"] as const;
export const planets = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"] as const;
export type Planet = typeof planets[number];
export type BirthInput = { date: string; time: string | null; placeId: string; consent: boolean };
export const places = [
  { id: "moscow", name: "Москва, Россия", lat: 55.7558, lon: 37.6173, zone: "Europe/Moscow" },
  { id: "spb", name: "Санкт-Петербург, Россия", lat: 59.9343, lon: 30.3351, zone: "Europe/Moscow" },
  { id: "ekb", name: "Екатеринбург, Россия", lat: 56.8389, lon: 60.6057, zone: "Asia/Yekaterinburg" },
  { id: "nsk", name: "Новосибирск, Россия", lat: 55.0084, lon: 82.9357, zone: "Asia/Novosibirsk" },
  { id: "minsk", name: "Минск, Беларусь", lat: 53.9006, lon: 27.559, zone: "Europe/Minsk" },
  { id: "almaty", name: "Алматы, Казахстан", lat: 43.222, lon: 76.8512, zone: "Asia/Almaty" },
  { id: "berlin", name: "Берлин, Германия", lat: 52.52, lon: 13.405, zone: "Europe/Berlin" },
  { id: "ny", name: "Нью-Йорк, США", lat: 40.7128, lon: -74.006, zone: "America/New_York" },
] as const;
export class NatalError extends Error {
  code: string;
  constructor(code: string, message: string) { super(message); this.code = code; }
}

export function validateBirth(value: unknown, now = new Date()): BirthInput {
  if (!value || typeof value !== "object") throw new NatalError("INVALID_INPUT", "Проверь данные рождения.");
  const x = value as Record<string, unknown>;
  if (typeof x.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(x.date)) throw new NatalError("DATE", "Укажи дату рождения.");
  const day = new Date(`${x.date}T00:00:00Z`);
  if (!Number.isFinite(day.getTime()) || day.toISOString().slice(0, 10) !== x.date || x.date < "1900-01-01" || x.date > now.toISOString().slice(0, 10)) throw new NatalError("DATE", "Нужна существующая дата между 1900 годом и сегодняшним днём.");
  if (x.time !== null && (typeof x.time !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(x.time))) throw new NatalError("TIME", "Укажи время или выбери «Не знаю».");
  if (!places.some(p => p.id === x.placeId)) throw new NatalError("PLACE", "Выбери город из списка. Другие города добавим перед запуском.");
  if (x.consent !== true) throw new NatalError("CONSENT", "Подтверди, что это твои данные или у тебя есть разрешение на их использование.");
  return { date: x.date, time: x.time as string | null, placeId: x.placeId as string, consent: true };
}

// Do not use the device's current UTC offset for a historical birth date.
// Historical tzdb data before 1970 and city-level boundaries need independent QA.
export function resolveBirthTime(input: BirthInput) {
  if (!input.time) throw new NatalError("UNKNOWN_TIME", "Без времени нельзя надёжно определить асцендент и дома. Нужен отдельный ограниченный формат разбора.");
  const place = places.find(p => p.id === input.placeId);
  if (!place) throw new NatalError("PLACE", "Неизвестное место рождения.");
  const wall = Date.parse(`${input.date}T${input.time}:00Z`);
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: place.zone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  const candidates: { utc: string; offsetHours: number }[] = [];
  for (let minutes = -840; minutes <= 840; minutes += 15) {
    const utc = new Date(wall - minutes * 60000);
    const parts = Object.fromEntries(fmt.formatToParts(utc).map(p => [p.type, p.value]));
    if (`${parts.year}-${parts.month}-${parts.day}` === input.date && `${parts.hour}:${parts.minute}` === input.time) candidates.push({ utc: utc.toISOString(), offsetHours: minutes / 60 });
  }
  if (!candidates.length) throw new NatalError("TIME_GAP", "Такого местного времени не было из-за перевода часов. Проверь время рождения; ранние исторические даты требуют отдельной проверки.");
  if (candidates.length > 1) throw new NatalError("TIME_FOLD", "В этот день часы переводили назад: указанное время встречалось дважды. До расчёта нужно уточнить часовой сдвиг.");
  return { ...candidates[0], place, precision: input.date < "1970-01-01" ? "historical-review-required" : "minute" };
}

export type Placement = { planet: Planet; longitude: number; house: number; retrograde: boolean };
export type Chart = { kind: "illustrative" | "calculated"; version: string; system: "tropical"; houseSystem: "placidus"; placements: Placement[] };
export function validateChart(chart: Chart): void {
  if (!chart || !["illustrative", "calculated"].includes(chart.kind) || chart.system !== "tropical" || chart.houseSystem !== "placidus" || typeof chart.version !== "string" || !chart.version || chart.version.length > 80 || !Array.isArray(chart.placements) || chart.placements.length !== planets.length) throw new NatalError("CHART_SCHEMA", "Неполная карта или неподдерживаемая система расчёта.");
  if (chart.kind === "calculated" && chart.version.startsWith("synthetic")) throw new NatalError("CHART_SCHEMA", "Учебный пример нельзя выдавать за расчёт.");
  for (const planet of planets) {
    const matches = chart.placements.filter(p => p && p.planet === planet);
    if (matches.length !== 1) throw new NatalError("CHART_SCHEMA", "Набор планет неполный или содержит повторения.");
    const p = matches[0];
    if (!Number.isFinite(p.longitude) || p.longitude < 0 || p.longitude >= 360 || !Number.isInteger(p.house) || p.house < 1 || p.house > 12 || typeof p.retrograde !== "boolean") throw new NatalError("CHART_SCHEMA", "Некорректные положения карты.");
  }
}
export function normalizePlanets(raw: unknown): Placement[] {
  if (!raw || typeof raw !== "object" || !Array.isArray((raw as { planets?: unknown }).planets)) throw new NatalError("PROVIDER_SCHEMA", "Расчётный сервис вернул неподдерживаемый ответ.");
  const rows = (raw as { planets: Record<string, unknown>[] }).planets;
  return planets.map(planet => {
    const matches = rows.filter(p => p && p.name === planet);
    if (matches.length !== 1) throw new NatalError("PROVIDER_SCHEMA", "Неполный или неоднозначный набор планет.");
    const p = matches[0];
    if (typeof p.full_degree !== "number" || !Number.isFinite(p.full_degree) || p.full_degree < 0 || p.full_degree >= 360 || typeof p.house !== "number" || !Number.isInteger(p.house) || p.house < 1 || p.house > 12 || ![true, false, "true", "false"].includes(p.is_retro as boolean | string)) throw new NatalError("PROVIDER_SCHEMA", "Некорректные координаты планеты.");
    if (p.sign_id !== undefined && p.sign_id !== Math.floor(p.full_degree / 30) + 1) throw new NatalError("PROVIDER_SCHEMA", "Знак не совпадает с координатами планеты.");
    return { planet, longitude: p.full_degree, house: p.house, retrograde: p.is_retro === true || p.is_retro === "true" };
  });
}
export const aspectRules = [{ name: "соединение", angle: 0, orb: 6 }, { name: "секстиль", angle: 60, orb: 4 }, { name: "квадрат", angle: 90, orb: 6 }, { name: "трин", angle: 120, orb: 6 }, { name: "оппозиция", angle: 180, orb: 6 }] as const;
export function calculateAspects(data: Placement[]) {
  return data.flatMap((a, i) => data.slice(i + 1).flatMap(b => {
    const distance = Math.abs(a.longitude - b.longitude);
    const angle = Math.min(distance, 360 - distance);
    const rule = aspectRules.find(r => Math.abs(angle - r.angle) <= r.orb);
    return rule ? [{ id: `aspect:${a.planet}:${b.planet}:${rule.angle}`, a: a.planet, b: b.planet, name: rule.name, orb: Math.abs(angle - rule.angle) }] : [];
  }));
}
export const planetNames: Record<Planet, string> = { Sun: "Солнце", Moon: "Луна", Mercury: "Меркурий", Venus: "Венера", Mars: "Марс", Jupiter: "Юпитер", Saturn: "Сатурн", Uranus: "Уран", Neptune: "Нептун", Pluto: "Плутон" };
const themes: Record<Planet, [string, string]> = {
  Sun: ["Твой способ проявляться", "Что помогает тебе чувствовать себя собой, даже когда никто не оценивает результат?"],
  Moon: ["Эмоции и чувство опоры", "Какие простые действия дают тебе ощущение безопасности и отдыха?"],
  Mercury: ["Мысли и общение", "Как тебе легче формулировать важное: в разговоре, письменно или после паузы?"],
  Venus: ["Близость и ценности", "Как ты выражаешь симпатию и по каким поступкам замечаешь заботу?"],
  Mars: ["Действие и границы", "Где тебе хочется действовать смелее, а где важно вовремя остановиться?"],
  Jupiter: ["Расширение горизонтов", "Какая новая область вызывает любопытство без требования немедленно стать лучшей?"],
  Saturn: ["Ответственность и устойчивость", "Какие правила поддерживают тебя, а какие стали чужим обязательством?"],
  Uranus: ["Свобода и перемены", "Что ты хотела бы попробовать, если бы не нужно было оправдывать свой выбор?"],
  Neptune: ["Воображение и идеалы", "Как отличить вдохновляющий образ от ожидания, которое не подтверждается действиями?"],
  Pluto: ["Глубина и пересмотр", "С какой привычкой можно расстаться постепенно, не требуя от себя полного перерождения?"],
};
const signThemes = ["инициативой и прямым действием", "устойчивостью и вниманием к ощутимому", "любопытством и обменом идеями", "заботой и эмоциональными связями", "творчеством и правом быть заметной", "практичностью и вниманием к деталям", "диалогом и поиском равновесия", "глубиной переживаний и вниманием к доверию", "исследованием и поиском смысла", "последовательностью и долгосрочными целями", "самостоятельностью мышления и новыми подходами", "воображением и восприимчивостью"];
export const houseThemes = ["самовыражение и первое впечатление", "личные ценности и отношение к ресурсам", "повседневное общение и обучение", "дом, близкие и чувство принадлежности", "творчество, удовольствие и игра", "ежедневные привычки и организация дел", "партнёрство и взаимные договорённости", "доверие, уязвимость и общие ресурсы", "мировоззрение, путешествия и новые знания", "общественная роль и долгосрочное направление", "дружба, сообщества и общие идеи", "уединение, внутренний мир и восстановление"];
export function buildReport(chart: Chart) {
  validateChart(chart);
  return chart.placements.map(p => {
    const signIndex = Math.floor(p.longitude / 30);
    const fact = `${planetNames[p.planet]}: ${zodiac[signIndex]}, ${Math.floor(p.longitude % 30)}°, дом ${p.house}${p.retrograde ? ", ретроградное движение" : ""}`;
    return { id: `placement:${p.planet}`, title: themes[p.planet][0], fact, text: `В астрологической символике этот знак связывают с ${signThemes[signIndex]}. В теме «${themes[p.planet][0].toLowerCase()}» это можно использовать как приглашение исследовать собственные привычки. Это не диагноз и не неизменная характеристика: сопоставь описание со своим реальным опытом.`, houseText: `Дом ${p.house} добавляет контекст: ${houseThemes[p.house - 1]}. Посмотри, как эта тема проявляется именно в твоей жизни; положение в доме само по себе не обещает конкретных событий.`, assertion: { planet: p.planet, signIndex, house: p.house, retrograde: p.retrograde }, question: themes[p.planet][1], evidenceIds: [`placement:${p.planet}`], editorialVersion: "aurora-editorial-draft-2" };
  });
}
export function buildAspectReadings(chart: Chart) {
  validateChart(chart);
  return calculateAspects(chart.placements).map(a => ({ ...a, evidenceIds: [a.id, `placement:${a.a}`, `placement:${a.b}`], text: a.name === "квадрат" || a.name === "оппозиция" ? "В астрологической традиции эту связь читают как разницу потребностей или способов действия. Это повод искать согласование, а не признак неизбежной проблемы. Какие две потребности ты можешь признать одновременно?" : a.name === "соединение" ? "Темы двух планет рассматривают вместе: они могут ощущаться тесно связанными. Исследуй, когда такое сочетание помогает, а когда хочется разделить задачи." : "Эту связь принято читать как возможность сотрудничества между темами. Возможность не равна гарантии: какое небольшое действие поможет использовать её осознанно?" }));
}
export function auditReport(chart: Chart, candidate: unknown) {
  validateChart(chart);
  if (!Array.isArray(candidate) || candidate.length !== 10) throw new NatalError("REPORT_SCHEMA", "Разбор должен содержать десять проверенных разделов.");
  const expected = buildReport(chart);
  const ids = new Set<string>();
  for (const section of candidate) {
    if (!section || typeof section !== "object" || typeof section.id !== "string" || ids.has(section.id)) throw new NatalError("REPORT_SCHEMA", "Повторный или некорректный раздел.");
    ids.add(section.id);
    const reference = expected.find(s => s.id === section.id);
    if (!reference || !Array.isArray(section.evidenceIds) || section.evidenceIds.length !== 1 || section.evidenceIds[0] !== reference.id || section.fact !== reference.fact) throw new NatalError("REPORT_EVIDENCE", "Утверждение не подтверждено данными карты.");
    if (!section.assertion || Object.entries(reference.assertion).some(([key, value]) => section.assertion[key] !== value)) throw new NatalError("REPORT_EVIDENCE", "Планета, знак или дом не совпадает с расчётом.");
    for (const key of ["title", "text", "houseText", "question"]) if (typeof section[key] !== "string" || !section[key].trim() || section[key].length > 4000) throw new NatalError("REPORT_SCHEMA", "Пустой или слишком длинный текст разбора.");
    // Supplementary lexical safety check, not semantic verification of AI prose.
    const prose = [section.text, section.houseText, section.question].join(" ");
    if (/<\/?[a-z][^>]*>/i.test(prose) || /неизбежно|точная дата смерти|гарантированн.{0,12}(доход|заработ|излеч)|у вас диагноз/i.test(prose)) throw new NatalError("REPORT_SAFETY", "Текст содержит недопустимое обещание или разметку.");
  }
  return { passed: true, sections: candidate.length, kind: chart.kind, chartVersion: chart.version, editorialVersion: "aurora-editorial-draft-2", rulesVersion: "natal-audit-1" };
}

// Synthetic fixture for layout/rule testing. NOT a real person's natal chart,
// NOT an astronomical reference, and never a fallback for provider failure.
export const demoChart: Chart = { kind: "illustrative", version: "synthetic-ui-1", system: "tropical", houseSystem: "placidus", placements: planets.map((planet, i) => ({ planet, longitude: [135, 282, 154, 102, 225, 15, 315, 310, 270, 240][i], house: [5, 10, 6, 4, 8, 1, 11, 11, 10, 9][i], retrograde: i === 6 })) };
