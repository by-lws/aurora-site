import {notFound} from "next/navigation";
import {initialCatalog} from "../../../lib/astro/catalog";
import {PersonalDetails} from "../../astro-components";
import {SiteHeader} from "../../components/site-header";
import {SiteFooter} from "../../components/site-footer";
import "../../astro.css";
export function generateStaticParams(){return initialCatalog.filter(p=>p.kind==="personal").map(p=>({slug:p.id}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return {title:initialCatalog.find(p=>p.id===slug)?.title??"Личная услуга"};}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!initialCatalog.some(p=>p.id===slug&&p.kind==="personal"))notFound();return <main className="astroPage"><div className="astroTop"><SiteHeader/></div><PersonalDetails id={slug}/><SiteFooter/></main>;}
