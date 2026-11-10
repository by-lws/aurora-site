import { telegram } from "../content";

export function MobileCta({ label = "написать Авроре" }: { label?: string }) {
  return <a className="mobileCta" href={telegram} target="_blank" rel="noreferrer">{label} <span>→</span></a>;
}
