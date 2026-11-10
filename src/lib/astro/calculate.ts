import * as A from "astronomy-engine";
import { planets, places, planetNames, zodiac, houseThemes, validateBirth, resolveBirthTime, NatalError, calculateAspects, type Chart, type BirthInput } from "../natal/core.ts";
import { buildExpress } from "./reports.ts";
const rad = Math.PI / 180;
export const wrap = (n: number) => ((n % 360) + 360) % 360;
const delta = (a: number, b: number) => ((a - b + 540) % 360) - 180;
export function placidus(date: Date, lat: number, lon: number) {
  if (!Number.isFinite(lat) || Math.abs(lat) >= 66 || !Number.isFinite(lon) || Math.abs(lon) > 180) throw new NatalError("POLAR_HOUSES", "Для этой широты требуется отдельная проверка системы домов.");
  const eps = Math.acos(A.Rotation_EQD_ECT(date).rot[1][1]);
  const theta = wrap(A.SiderealTime(date) * 15 + lon);
  const fromRA = (ra: number) => wrap(Math.atan2(Math.sin(ra * rad) / Math.cos(eps), Math.cos(ra * rad)) / rad);
  const mc = fromRA(theta);
  const asc = wrap(Math.atan2(-Math.cos(theta * rad), Math.sin(theta * rad) * Math.cos(eps) + Math.tan(lat * rad) * Math.sin(eps)) / rad + 180);
  function cusp(fraction: number, sign: number) {
    let lambda = fromRA(theta + sign * 90 * fraction);
    for (let n = 0; n < 100; n++) {
      const dec = Math.asin(Math.sin(lambda * rad) * Math.sin(eps));
      const cosH = -Math.tan(lat * rad) * Math.tan(dec);
      if (Math.abs(cosH) >= 1) throw new NatalError("POLAR_HOUSES", "Не удалось надёжно рассчитать дома для этой широты.");
      const next = fromRA(theta + sign * Math.acos(cosH) / rad * fraction);
      if (Math.abs(delta(next, lambda)) < 1e-8) return next;
      lambda = next;
    }
    throw new NatalError("HOUSE_CONVERGENCE", "Расчёт домов требует дополнительной проверки.");
  }
  const h11 = cusp(1 / 3, 1), h12 = cusp(2 / 3, 1);
  // Below the horizon the nocturnal arc is the complement of the diurnal arc.
  const h9 = cusp(1 / 3, -1), h8 = cusp(2 / 3, -1);
  const cusps = [asc, wrap(h8 + 180), wrap(h9 + 180), wrap(mc + 180), wrap(h11 + 180), wrap(h12 + 180), wrap(asc + 180), h8, h9, mc, h11, h12];
  if (Math.abs(cusps.reduce((sum, c, i) => sum + wrap(cusps[(i + 1) % 12] - c), 0) - 360) > 0.001) throw new NatalError("HOUSE_ORDER", "Не удалось проверить порядок домов.");
  return { asc, mc, cusps };
}
export function calculateAt(utc: string, lat: number, lon: number) {
  const date = new Date(utc);
  if (!Number.isFinite(date.getTime())) throw new NatalError("DATE", "Некорректный момент расчёта.");
  const angles = placidus(date, lat, lon);
  const longitude = (body: A.Body, time: Date) => A.Ecliptic(A.GeoVector(body, time, true)).elon;
  const chart: Chart = { kind: "calculated", version: "astronomy-engine-2.1.19-placidus-1", system: "tropical", houseSystem: "placidus", placements: planets.map(planet => {
    const body = A.Body[planet], degree = longitude(body, date);
    let house = 0;
    for (let i = 0; i < 12; i++) if (wrap(degree - angles.cusps[i]) < wrap(angles.cusps[(i + 1) % 12] - angles.cusps[i])) { house = i + 1; break; }
    if (!house) throw new NatalError("HOUSE_ASSIGNMENT", "Не удалось определить дом планеты.");
    return { planet, longitude: degree, house, retrograde: delta(longitude(body, new Date(date.getTime() + 1800000)), longitude(body, new Date(date.getTime() - 1800000))) < 0 };
  }) };
  return { chart, ...angles };
}
export function astroLines(utc: string) {
  const date = new Date(utc), gast = A.SiderealTime(date) * 15;
  return planets.map(planet => {
    const eq = A.EquatorFromVector(A.RotateVector(A.Rotation_EQJ_EQD(date), A.GeoVector(A.Body[planet], date, true)));
    const mc = wrap(eq.ra * 15 - gast + 180) - 180;
    const rise: [number, number][] = [], set: [number, number][] = [];
    for (let lat = -80; lat <= 80; lat += 2) {
      const x = -Math.tan(lat * rad) * Math.tan(eq.dec * rad);
      if (Math.abs(x) >= 1) continue;
      const h = Math.acos(x) / rad;
      rise.push([wrap(mc - h + 180) - 180, lat]); set.push([wrap(mc + h + 180) - 180, lat]);
    }
    return { planet, mc, ic: wrap(mc + 360) - 180, rise, set };
  });
}
export function calculateReading(input: BirthInput, product: "natal" | "relocation", destinationId?: string) {
  const birth = validateBirth(input), resolved = resolveBirthTime(birth);
  if (resolved.precision !== "minute") throw new NatalError("HISTORICAL_REVIEW", "Даты до 1970 года пока требуют ручной проверки. Тестовый заказ не создан.");
  const natal = calculateAt(resolved.utc, resolved.place.lat, resolved.place.lon);
  const aspects = calculateAspects(natal.chart.placements).sort((a,b) => a.orb - b.orb);
  const signature = `ASC: ${zodiac[Math.floor(natal.asc / 30)]}, ${(natal.asc % 30).toFixed(1)}°. MC: ${zodiac[Math.floor(natal.mc / 30)]}, ${(natal.mc % 30).toFixed(1)}°.`;
  const sections = buildExpress(natal.chart, true).map(s => {
    if (s.id === "signature") return { ...s, text: `${planetNames.Sun}: ${zodiac[Math.floor(natal.chart.placements[0].longitude / 30)]}. ${planetNames.Moon}: ${zodiac[Math.floor(natal.chart.placements[1].longitude / 30)]}. ${signature}` };
    if (s.id === "features") return { ...s, text: `В рассчитанной карте ${aspects.length} основных аспектов. Самые точные: ${aspects.slice(0,4).map(a => `${planetNames[a.a]} — ${planetNames[a.b]}: ${a.name}, орбис ${a.orb.toFixed(1)}°`).join("; ") || "нет аспектов в принятом диапазоне орбисов"}. Это символические связи, а не предсказание событий.` };
    const names: Record<string,string> = { personality: "Sun", emotions: "Moon", relations: "Venus", talents: "Mercury" };
    const p = natal.chart.placements.find(p => p.planet === names[s.id]);
    return p ? { ...s, text: `${planetNames[p.planet]}: ${zodiac[Math.floor(p.longitude/30)]}, ${(p.longitude%30).toFixed(1)}°, дом ${p.house}. ${s.text}` } : s;
  });
  const destination = product === "relocation" ? places.find(p => p.id === destinationId) : undefined;
  if (product === "relocation" && !destination) throw new NatalError("DESTINATION", "Выберите город назначения.");
  const relocated = destination ? calculateAt(resolved.utc, destination.lat, destination.lon) : null;
  return { product, title: product === "natal" ? "Натальная карта (экспрес)" : "Релокация и карта мира", engine: "Astronomy Engine 2.1.19 · тропический зодиак · Плацидус", editorial: "Авторские тексты сайта, редакционная версия 1. Не личная консультация Авроры.", chart: natal.chart, asc: natal.asc, mc: natal.mc, cusps: natal.cusps, birthplace: resolved.place.name, destination: destination ? { name: destination.name, lat: destination.lat, lon: destination.lon } : null, relocated, lines: product === "relocation" ? astroLines(resolved.utc) : [], sections: product === "natal" ? sections : [
    { id: "angles", title: "Углы в новом городе", text: `В городе ${destination!.name} ASC — ${zodiac[Math.floor(relocated!.asc / 30)]}, MC — ${zodiac[Math.floor(relocated!.mc / 30)]}. Момент рождения и градусы планет сохраняются.` },
    ...["Sun", "Moon", "Venus", "Mercury", "Mars"].map(planet => { const a = natal.chart.placements.find(p => p.planet === planet)!, b = relocated!.chart.placements.find(p => p.planet === planet)!; return { id: planet, title: planetNames[a.planet], text: `Натальный дом ${a.house}; в новом городе — ${b.house}. Символический контекст: ${houseThemes[b.house - 1]}. ${a.house === b.house ? "Дом сохраняется." : "Изменение дома предлагает исследовать эту тему в новом окружении."} Это не обещание событий и не рекомендация переезжать.` }; })
  ] };
}
export type Reading = ReturnType<typeof calculateReading>;
