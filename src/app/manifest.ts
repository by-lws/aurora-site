import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aurora World — aurora’s room",
    short_name: "Aurora",
    description: "Таро, ритуалы и возвращение к себе с Авророй",
    lang: "ru",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f6f0e8",
    theme_color: "#3d2b53",
    icons: [
      { src: "/aurora-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/aurora-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/aurora-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
