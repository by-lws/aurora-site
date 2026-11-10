import {buildReport,calculateAspects,validateChart,type Chart,type BirthInput,NatalError,places,resolveBirthTime} from "../natal/core.ts";
export function buildExpress(chart:Chart,knownTime:boolean){
  validateChart(chart);const s=buildReport(chart);const read=(id:string)=>s.find(x=>x.id===`placement:${id}`)!;
  const fact=(id:string)=>knownTime?read(id).fact:read(id).fact.replace(/, дом \d+/g,"");
  return [
    {id:"signature",title:"Визитная карточка",text:`${fact("Sun")}. ${fact("Moon")}. ${knownTime?"Асцендент добавим после проверенного расчёта углов; в учебном примере он не задан.":"Время неизвестно: ASC/MC и дома исключены. Если Луна меняет знак в течение суток, её положение требует отдельной проверки."}`},
    {id:"personality",title:"Личность и самовыражение",text:read("Sun").text},
    {id:"emotions",title:"Эмоции и внутренний мир",text:read("Moon").text},
    {id:"relations",title:"Отношения и потребности",text:read("Venus").text},
    {id:"talents",title:"Таланты, деятельность и ресурсы",text:read("Mercury").text+" Отношение к деньгам исследуем через привычки и ценности, без обещания финансовых результатов."},
    {id:"features",title:"Ключевые особенности карты",text:`В учебном наборе ${calculateAspects(chart.placements).length} основных аспектов. Это не предсказание событий. Для связного индивидуального анализа можно записаться на полный натальный разбор к Авроре.`},
  ];
}
export function validateRelocation(pair:{utc:string;relocatedUtc:string;natal:Chart;relocated:Chart}){
  validateChart(pair.natal);validateChart(pair.relocated);
  if(!Number.isFinite(Date.parse(pair.utc))||Date.parse(pair.utc)!==Date.parse(pair.relocatedUtc))throw new NatalError("RELOCATION_TIME","При релокации нельзя менять момент рождения UTC.");
  if(pair.natal.system!==pair.relocated.system||pair.natal.houseSystem!==pair.relocated.houseSystem||pair.natal.kind!==pair.relocated.kind)throw new NatalError("RELOCATION_SYSTEM","Настройки карт должны совпадать.");
  for(const p of pair.natal.placements){const q=pair.relocated.placements.find(s=>s.planet===p.planet)!;if(Math.abs(p.longitude-q.longitude)>1e-8||p.retrograde!==q.retrograde)throw new NatalError("RELOCATION_PLANETS","При релокации градусы планет должны оставаться прежними.");}
  return pair.natal.placements.flatMap(p=>{const q=pair.relocated.placements.find(s=>s.planet===p.planet)!;return p.house!==q.house?[{planet:p.planet,from:p.house,to:q.house}]:[];});
}
export function prepareRelocation(birth:BirthInput,destinationId:string){
  const r=resolveBirthTime(birth);const destination=places.find(p=>p.id===destinationId);if(!destination)throw new NatalError("DESTINATION","Выберите один город из списка.");
  if(r.precision!=="minute")throw new NatalError("HISTORICAL_REVIEW","Историческое время требует проверки.");
  return {utc:r.utc,birthplace:r.place,destination};
}
