export function GET() {
  return Response.json({ stage: "prototype", personalCalculationEnabled: false, checkoutEnabled: false }, { headers: { "Cache-Control": "no-store" } });
}
export function POST() {
  // Fail closed: no birth data is read, logged or forwarded until privacy,
  // provider accuracy, durable jobs and payment controls have passed review.
  return Response.json({ code: "NOT_LAUNCHED", message: "Персональные расчёты и оплата ещё не запущены. Доступен только учебный пример." }, { status: 503, headers: { "Cache-Control": "no-store" } });
}
