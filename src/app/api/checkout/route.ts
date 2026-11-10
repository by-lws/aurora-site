import { cacheHeaders, checkOrigin, checkout, config, cookie, failure, findOrder, newSession, reconcile, reserve, session } from "../../../lib/astro/checkout";
export const runtime = "nodejs";
export async function GET(request: Request) {
  try {
    config();
    const id = new URL(request.url).searchParams.get("order");
    if (!id) {
      const token = session(request) || newSession();
      return Response.json({ test: true, configured: true }, { headers: { ...cacheHeaders, "Set-Cookie": cookie(token) } });
    }
    const token = session(request), row = token ? await findOrder(id, token) : null;
    if (!row) return Response.json({ message: "Заказ не найден в этом браузере или срок доступа истёк." }, { status: 404, headers: cacheHeaders });
    return Response.json(await reconcile(row), { headers: cacheHeaders });
  } catch (e) { return failure(e); }
}
export async function POST(request: Request) {
  try {
    const origin = checkOrigin(request), token = session(request);
    if (!token) return Response.json({ message: "Обновите страницу, чтобы начать защищённый сеанс." }, { status: 401, headers: cacheHeaders });
    if (Number(request.headers.get("content-length") || 0) > 4096) return new Response(null, { status: 413 });
    const text = await request.text();
    if (text.length > 4096) return new Response(null, { status: 413 });
    const row = await reserve(token, request.headers.get("Idempotency-Key") || "", JSON.parse(text));
    return Response.json(await checkout(row, origin), { headers: cacheHeaders });
  } catch (e) { return failure(e); }
}
