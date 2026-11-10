"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const motionGroups = [
  { selector: ".stars,.finalStars,.passportStamp,.photoLabel", distance: 52, rotation: 7 },
  { selector: ".stickerNote,.memeLine,.catBadge,.ritualNotice", distance: -38, rotation: -4 },
  { selector: ".portraitFrame,.aboutPortrait,.portraitTall", distance: 28, rotation: 1.8 },
  { selector: ".serviceCard:nth-child(odd),.noteOne,.postcard.pOne,.deckCard.dOne,.divineCardMoon", distance: 34, rotation: 3.5 },
  { selector: ".serviceCard:nth-child(even),.noteTwo,.postcard.pThree,.deckCard.dThree,.divineCardCat", distance: -34, rotation: -3.5 },
  { selector: ".clubTicket,.individualTicket,.monthCalendar,.clubTicketPage", distance: 42, rotation: 2.5 },
  { selector: ".sunDisc,.travelOrbit,.bigMoon,.portraitHalo", distance: -24, rotation: 8 },
  { selector: ".proofCat,.aboutCat,.innerCat,.photoCat,.outcomeCat,.clubForCat", distance: 58, rotation: 5 },
  { selector: ".flyingCard.cardA,.postcard.pTwo,.deckCard.dTwo,.divineCardRoad", distance: -48, rotation: -5 },
  { selector: ".flyingCard.cardB,.clubHeroCat,.deckCat", distance: 48, rotation: 5 },
] as const;

export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lightweightMode = window.matchMedia("(max-width: 768px), (pointer: coarse)").matches;
    const revealElements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal],[data-aurora-reveal]"));
    if (reduceMotion) {
      revealElements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    // Only hide new blocks that start below the fold. Content stays visible if
    // JS never runs, and the first screen never flashes out during hydration.
    revealElements.forEach(element => {
      if (element.hasAttribute("data-aurora-reveal") && element.getBoundingClientRect().top > window.innerHeight * .88) element.classList.add("auroraRevealPending");
    });

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          entry.target.classList.remove("auroraRevealPending");
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" },
    );
    revealElements.forEach((element) => observer.observe(element));

    const legacyElements = lightweightMode
      ? []
      : motionGroups.flatMap(({ selector, distance, rotation }) =>
          Array.from(document.querySelectorAll<HTMLElement>(selector)).map((element) => ({ element, distance, rotation, custom: false })),
        );
    const newElements = Array.from(document.querySelectorAll<HTMLElement>("[data-aurora-motion]")).slice(0,8).map(element => {
      const kind = element.dataset.auroraMotion;
      const distance = kind === "cloud" ? 10 : kind === "cards" ? -24 : 22;
      const rotation = kind === "orbit" ? 30 : kind === "cloud" ? 0 : kind === "cat" ? -9 : 12;
      return { element, distance: distance * (lightweightMode ? .6 : 1), rotation: rotation * (lightweightMode ? .65 : 1), custom: true };
    });
    const movingElements = [...legacyElements,...newElements];

    if (!movingElements.length) {
      return () => { observer.disconnect(); revealElements.forEach(e => e.classList.remove("auroraRevealPending")); };
    }

    let frame = 0;
    let previousScroll = window.scrollY;
    const updateMotion = () => {
      const viewport = window.innerHeight || 1;
      const currentScroll = window.scrollY;
      document.body.dataset.scrollDirection = currentScroll >= previousScroll ? "down" : "up";
      previousScroll = currentScroll;
      const positions = movingElements.map(({ element, distance, rotation, custom }) => {
        const rect = (custom ? element.parentElement || element : element).getBoundingClientRect();
        if (rect.bottom < -viewport || rect.top > viewport * 2) return null;
        const progress = Math.max(-1.35, Math.min(1.35, (rect.top + rect.height / 2 - viewport / 2) / viewport));
        return { element, distance, rotation, progress, custom };
      });
      positions.forEach((position) => {
        if (!position) return;
        const { element, distance, rotation, progress, custom } = position;
        if(custom) {
          element.style.setProperty("--scroll-y",`${(-progress * distance).toFixed(2)}px`);
          element.style.setProperty("--scroll-r",`${(-progress * rotation).toFixed(2)}deg`);
          return;
        }
        element.style.translate = `0 ${(-progress * distance).toFixed(2)}px`;
        element.style.rotate = `${(-progress * rotation).toFixed(2)}deg`;
      });
      frame = 0;
    };
    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateMotion);
    };

    updateMotion();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      observer.disconnect();
      revealElements.forEach(e => e.classList.remove("auroraRevealPending"));
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
      movingElements.forEach(({ element }) => {
        element.style.removeProperty("translate");
        element.style.removeProperty("rotate");
        element.style.removeProperty("--scroll-y");
        element.style.removeProperty("--scroll-r");
      });
    };
  }, [pathname]);

  return null;
}
