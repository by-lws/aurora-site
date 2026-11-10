import styles from "./aurora-art.module.css";

export function MoonCat({ className = "", sleepy = false, mark = false }: { className?: string; sleepy?: boolean; mark?: boolean }) {
  return <svg className={`${styles.cat} ${className}`} viewBox={mark ? "55 30 105 85" : "0 0 210 190"} style={mark ? { overflow: "hidden" } : undefined} fill="none" stroke="currentColor" strokeWidth={mark ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M51 148C38 143 33 127 40 113c7-15 22-25 26-43l-3-35 27 16c12-4 25-4 37 0l25-17-1 38c13 17 20 38 18 58-1 17-10 27-25 29H76"/>
    <path d="m69 45 4 23 11-10m57-14-13 15 16 10M68 79c-1 17 12 32 34 33 22 1 40-10 43-28"/>
    <g className={styles.eyes}>{sleepy ? <><path d="m78 81 7 4 8-4m23 0 7 4 9-4"/></> : <><path d="M77 80c6-3 12-2 17 2m22 0c5-4 11-4 16-2"/><path d="M87 82v7m36-7v7"/></>}</g>
    <path d="m101 91 5 4 5-4m-5 4v5m0 0c-3 4-7 4-10 1m10-1c3 4 7 4 10 1M70 93l-15-3m15 9-18 3m87-9 15-3m-15 9 18 3M85 119c-8 8-11 17-10 29m23-30c-2 12-2 23 0 34m24-33c4 12 4 24 1 34m22-34c3 10 1 22-2 29M75 149l-3 7h26m25-3-1 4h22"/>
    <g className={styles.tail}><path d="M145 157c16 8 36 3 40-10 4-12-3-21-11-17-7 4-1 13-8 17-4 2-10 1-14-1"/></g>
    <path d="M66 121l5 6m64-10 5 7M50 129l7 5m100-27 4 6M57 160c-11-8-27-6-31 5-12-3-20 3-19 10h187c1-8-7-15-18-12m-161 5c4-3 8-3 13-1m4 7h20m101-1h18" opacity=".65"/>
    <path d="m178 40 3 9 9 3-9 3-3 9-3-9-9-3 9-3 3-9Z" strokeWidth="1"/>
  </svg>;
}

export function CloudBank({ className = "", lined = true }: { className?: string; lined?: boolean }) {
  return <svg viewBox="0 0 1440 270" className={`${styles.cloud} ${className}`} aria-hidden="true" focusable="false" preserveAspectRatio="none">
    <path d="M-30 146C8 115 32 121 56 136c-5-34 22-54 50-47 7-38 42-62 78-50 29-25 78-10 81 23 26-12 58-2 69 20 27-40 79-47 112-16 27-18 69-9 80 16 33-48 105-48 132-4 27-12 59 1 68 27 25-21 63-18 84 4 7-41 48-65 83-48 29-36 88-30 105 5 43-15 82 7 87 43 31-21 75-11 86 18 31-30 71-22 85 3 30-13 68-1 82 27 39-17 78-2 103 12v160H-30Z" fill="currentColor"/>
    {lined && <g fill="none" stroke="var(--cloud-ink, #b5a18e)" strokeWidth=".9" opacity=".4"><path d="M-30 146c38-31 62-25 86-10-5-34 22-54 50-47 7-38 42-62 78-50 29-25 78-10 81 23m-74 9c22-12 53-5 61 17 22-7 43 3 48 17m72-11c22-29 63-29 84-2 27-18 69-9 80 16m35-9c9-35 58-47 84-23 25-10 54 4 59 25m108 33c7-41 48-65 83-48 29-36 88-30 105 5 43-15 82 7 87 43m64 14c25-24 60-17 71 4 30-13 68-1 82 27"/><path d="M81 150h41m-28 7h24m253-32h37m-24 7h20m312 17h50m-34 7h25m306-26h31m-20 7h17m197 39h33"/></g>}
  </svg>;
}

export function TarotDrawing({ className = "" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 220 260" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" aria-hidden="true" focusable="false"><rect x="32" y="28" width="142" height="210" rx="62" transform="rotate(-10 103 133)" opacity=".45"/><rect x="55" y="20" width="142" height="210" rx="6" transform="rotate(8 126 125)"/><rect x="65" y="30" width="122" height="190" rx="3" transform="rotate(8 126 125)" opacity=".45"/><path d="m122 72 7 27 27 7-27 7-7 27-7-27-27-7 27-7 7-27Z"/><circle cx="122" cy="106" r="45" opacity=".3"/><path d="M146 155c-15 10-32 6-37-8 1 18 24 27 37 8ZM88 176h62m-53 7h44m-31-127h22"/><path d="m77 59 2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6Zm84 94 2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6Z"/></svg>;
}

export function CompassMark({ className = "" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 160 160" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true" focusable="false"><circle cx="80" cy="80" r="64"/><circle cx="80" cy="80" r="53" opacity=".4"/><path d="m80 20 9 51 51 9-51 9-9 51-9-51-51-9 51-9 9-51Z"/><path d="m80 62 8 10 10 8-10 8-8 10-8-10-10-8 10-8 8-10ZM35 35l18 18m54 54 18 18M35 125l18-18m54-54 18-18"/><circle cx="80" cy="80" r="3" fill="currentColor"/></svg>;
}
