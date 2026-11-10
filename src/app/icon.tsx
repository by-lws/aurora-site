import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
  const image = await readFile(join(process.cwd(), "public/aurora-icon-64.png"));
  return new Response(image, { headers: { "Content-Type": contentType } });
}
