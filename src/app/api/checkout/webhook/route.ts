import { cacheHeaders, failure, webhookPayment } from "../../../../lib/astro/checkout";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const text = await request.text();
    if (text.length > 8192) return new Response(null, { status: 413 });
    const event = JSON.parse(text);
    if (event.type !== "notification" || !["payment.succeeded", "payment.canceled", "refund.succeeded"].includes(event.event)) return Response.json({ received: true }, { headers: cacheHeaders });
    const paymentId = event.event === "refund.succeeded" ? event.object?.payment_id : event.object?.id;
    if (typeof paymentId !== "string") return new Response(null, { status: 400 });
    // Ignore the supplied status/amount/metadata; retrieve the payment with the
    // shop's authenticated API before making any report available.
    await webhookPayment(paymentId);
    return Response.json({ received: true }, { headers: cacheHeaders });
  } catch (e) { return failure(e); }
}
