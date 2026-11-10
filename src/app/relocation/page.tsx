import {SiteHeader} from "../components/site-header";import {SiteFooter} from "../components/site-footer";import {AutomaticStudio} from "../automatic-studio";import "../astro.css";
export const metadata={title:"Релокация одного города — 1 500 ₽",description:"Тот же момент рождения и один новый город. Автоматический продукт отдельно от личного сравнения трёх городов.",robots:{index:false,follow:true}};
export default function Relocation(){return <main className="astroPage"><div className="astroTop"><SiteHeader/></div><AutomaticStudio id="relocation"/><SiteFooter/></main>;}
