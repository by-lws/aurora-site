// Server-only adapter. Never import this module from a client component.
import { Buffer } from "node:buffer";
import type { Order, VerifiedPayment } from "./orders.ts";

export class PaymentError extends Error {
  code: string;
  constructor(code: string) { super(code); this.code = code; }
}
type Config = { shopId: string; secretKey: string; returnOrigin: string };
type Json = Record<string, unknown>;
const api = "https://api.yookassa.ru/v3/payments";
const paymentId = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
function object(value: unknown): Json {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new PaymentError("PAYMENT_SCHEMA");
  return value as Json;
}
function validateConfig(config: Config) {
  // This release deliberately cannot use a live merchant key.
  if (config.shopId !== "1511648" || !/^test_[A-Za-z0-9_-]{20,}$/.test(config.secretKey)) throw new PaymentError("TEST_SHOP_REQUIRED");
  if (!["https://xoxoaurora.ru", "https://auroras-room-beta.vercel.app"].includes(config.returnOrigin)) throw new PaymentError("RETURN_ORIGIN_INVALID");
}
function validateExpected(config: Config, order: Pick<Order, "id" | "productId" | "amountMinor" | "currency" | "merchantId" | "testMode">) {
  validateConfig(config);
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(order.id) || !["natal", "relocation"].includes(order.productId) || order.testMode !== true || order.merchantId !== config.shopId || order.currency !== "RUB" || !Number.isSafeInteger(order.amountMinor) || order.amountMinor <= 0 || order.amountMinor > 100000000) throw new PaymentError("INVALID_TEST_ORDER");
}
function minor(value: unknown) {
  if (typeof value !== "string" || !/^(0|[1-9]\d{0,6})\.\d{2}$/.test(value)) throw new PaymentError("PAYMENT_SCHEMA");
  const [rub, kop] = value.split(".");
  return Number(rub) * 100 + Number(kop);
}
async function request(config: Config, path: string, init: RequestInit, fetcher: typeof fetch): Promise<Json> {
  let response: Response;
  try {
    response = await fetcher(api + path, { ...init, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15000), headers: { ...init.headers, Authorization: `Basic ${Buffer.from(`${config.shopId}:${config.secretKey}`).toString("base64")}`, "Content-Type": "application/json" } });
  } catch { throw new PaymentError("PAYMENT_PROVIDER_UNAVAILABLE"); }
  // A timeout/5xx may follow a successful create. Caller must retry the SAME
  // persisted idempotency key, never generate a new order in response.
  if (!response.ok) throw new PaymentError(response.status >= 500 || response.status === 429 ? "PAYMENT_PROVIDER_UNAVAILABLE" : "PAYMENT_PROVIDER_REJECTED");
  try { return object(await response.json()); } catch { throw new PaymentError("PAYMENT_SCHEMA"); }
}
function match(raw: Json, config: Config, order: Pick<Order, "id" | "amountMinor" | "productId">) {
  const amount = object(raw.amount), recipient = object(raw.recipient), metadata = object(raw.metadata);
  if (typeof raw.id !== "string" || !paymentId.test(raw.id) || raw.test !== true || recipient.account_id !== config.shopId || amount.currency !== "RUB" || minor(amount.value) !== order.amountMinor || metadata.order_id !== order.id || metadata.product_id !== order.productId) throw new PaymentError("PAYMENT_MISMATCH");
}
export async function createTestCheckout(config: Config, order: Pick<Order, "id" | "productId" | "amountMinor" | "currency" | "merchantId" | "testMode">, idempotencyKey: string, fetcher: typeof fetch = fetch) {
  validateExpected(config, order);
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(idempotencyKey)) throw new PaymentError("IDEMPOTENCY_KEY_REQUIRED");
  const value = `${Math.floor(order.amountMinor / 100)}.${String(order.amountMinor % 100).padStart(2, "0")}`;
  const raw = await request(config, "", { method: "POST", headers: { "Idempotence-Key": idempotencyKey }, body: JSON.stringify({ amount: { value, currency: "RUB" }, capture: true, confirmation: { type: "redirect", return_url: `${config.returnOrigin}/payment/return?order=${encodeURIComponent(order.id)}` }, description: `Aurora · тест · ${order.productId === "natal" ? "Натальная карта (экспрес)" : "Релокация"}`, metadata: { order_id: order.id, product_id: order.productId } }) }, fetcher);
  match(raw, config, order);
  // Repeating creation after payment can return the completed object.
  if (raw.status === "succeeded" && raw.paid === true) return { paymentId: raw.id as string, status: "succeeded" as const, confirmationUrl: null };
  if (raw.status !== "pending") throw new PaymentError("PAYMENT_NOT_PENDING");
  const confirmation = object(raw.confirmation);
  let url: URL;
  try { url = new URL(String(confirmation.confirmation_url)); } catch { throw new PaymentError("PAYMENT_SCHEMA"); }
  if (confirmation.type !== "redirect" || url.protocol !== "https:" || url.hostname !== "yoomoney.ru" || url.username || url.password || url.port) throw new PaymentError("PAYMENT_REDIRECT_INVALID");
  return { paymentId: raw.id as string, status: "pending" as const, confirmationUrl: url.href };
}
export async function verifyTestPayment(config: Config, order: Order, fetcher: typeof fetch = fetch): Promise<VerifiedPayment> {
  validateExpected(config, order);
  if (!paymentId.test(order.paymentId)) throw new PaymentError("PAYMENT_ID_INVALID");
  // Webhook payloads and the browser return are never proof of payment.
  const raw = await request(config, `/${order.paymentId}`, { method: "GET" }, fetcher);
  match(raw, config, order);
  if (raw.id !== order.paymentId) throw new PaymentError("PAYMENT_MISMATCH");
  if (raw.status === "canceled") throw new PaymentError("PAYMENT_CANCELED");
  if (raw.refunded_amount && minor(object(raw.refunded_amount).value) > 0) throw new PaymentError("PAYMENT_REFUNDED");
  if (raw.status !== "succeeded" || raw.paid !== true) throw new PaymentError("PAYMENT_NOT_SUCCEEDED");
  return { verification: "provider-api", id: order.paymentId, orderId: order.id, merchantId: config.shopId, amountMinor: order.amountMinor, currency: "RUB", testMode: true, status: "succeeded" };
}
