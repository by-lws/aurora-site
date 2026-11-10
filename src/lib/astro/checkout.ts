import { createHash, randomBytes, randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { initialCatalog, quoteAutomatic } from "./catalog.ts";
import { calculateReading, type Reading } from "./calculate.ts";
import { validateBirth, NatalError } from "../natal/core.ts";
import { createTestCheckout, verifyTestPayment, PaymentError } from "../natal/yookassa.ts";
import { createOrder } from "../natal/orders.ts";
export const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
export const digest = (value: string) => createHash("sha256").update(value).digest("hex");
export const cacheHeaders = { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff" };
export function config(origin?: string) {
  const returnOrigin = origin || process.env.YOOKASSA_RETURN_ORIGIN || "";
  if (!process.env.DATABASE_URL || !process.env.YOOKASSA_SECRET_KEY?.startsWith("test_") || process.env.YOOKASSA_SHOP_ID !== "1511648" || !["https://xoxoaurora.ru", "https://auroras-room-beta.vercel.app"].includes(returnOrigin)) throw new PaymentError("NOT_CONFIGURED");
  return { shopId: "1511648", secretKey: process.env.YOOKASSA_SECRET_KEY, returnOrigin };
}
function db() { config(); return neon(process.env.DATABASE_URL!); }
export function session(request: Request) {
  const value = request.headers.get("cookie")?.split(";").map(v => v.trim()).find(v => v.startsWith("aurora_checkout="))?.slice("aurora_checkout=".length);
  return value && /^[a-f0-9]{64}$/.test(value) ? value : null;
}
export function newSession() { return randomBytes(32).toString("hex"); }
export function cookie(value: string) { return `aurora_checkout=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`; }
export function checkOrigin(request: Request) {
  const origin = request.headers.get("origin"), own = new URL(request.url).origin;
  if (origin !== own || !["https://xoxoaurora.ru", "https://auroras-room-beta.vercel.app"].includes(own)) throw new PaymentError("ORIGIN_INVALID");
  return own;
}
export type CheckoutRow = { id: string; session_hash: string; idempotency_key: string; request_hash: string; product_id: "natal" | "relocation"; amount_minor: number; payment_id: string | null; confirmation_url: string | null; status: string; report: Reading };
export function publicOrder(row: CheckoutRow) {
  return { id: row.id, status: row.status, test: true, amountMinor: row.amount_minor, product: row.product_id, report: row.status === "ready" ? row.report : null };
}
export async function reserve(token: string, key: string, raw: unknown): Promise<CheckoutRow> {
  if (!uuid.test(key) || !raw || typeof raw !== "object") throw new PaymentError("INVALID_REQUEST");
  const value = raw as Record<string, unknown>;
  if (value.product !== "natal" && value.product !== "relocation") throw new PaymentError("INVALID_PRODUCT");
  if (value.testConsent !== true) throw new NatalError("CONSENT", "Подтвердите тестовый режим и обработку вымышленных данных.");
  const birth = validateBirth(value.birth);
  const fingerprint = digest(JSON.stringify([value.product, birth, value.product === "relocation" ? value.destination : null]));
  const sql = db(), hash = digest(token);
  const old = await sql.query("SELECT * FROM aurora_test_checkout WHERE session_hash=$1 AND idempotency_key=$2 AND expires_at>now()", [hash, key]);
  if (old.length) {
    if (old[0].request_hash !== fingerprint) throw new PaymentError("IDEMPOTENCY_CONFLICT");
    return old[0] as CheckoutRow;
  }
  const limits = await sql.query("SELECT count(*) FILTER (WHERE session_hash=$1)::int AS session_count, count(*)::int AS total FROM aurora_test_checkout WHERE created_at>now()-interval '1 hour'", [hash]);
  if (limits[0].session_count >= 5 || limits[0].total >= 50) throw new PaymentError("TEST_RATE_LIMIT");
  // Validate calculations before creating any payment. The result stays private
  // in the database until authenticated provider verification unlocks it.
  const report = calculateReading(birth, value.product, typeof value.destination === "string" ? value.destination : undefined);
  const quote = quoteAutomatic(initialCatalog, value.product);
  const rows = await sql.query("INSERT INTO aurora_test_checkout (id,session_hash,idempotency_key,request_hash,product_id,amount_minor,report) VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb) ON CONFLICT (session_hash,idempotency_key) DO UPDATE SET idempotency_key=EXCLUDED.idempotency_key RETURNING *", [randomUUID(), hash, key, fingerprint, quote.productId, quote.amountMinor, JSON.stringify(report)]);
  if (rows[0].request_hash !== fingerprint) throw new PaymentError("IDEMPOTENCY_CONFLICT");
  return rows[0] as CheckoutRow;
}
export async function checkout(row: CheckoutRow, origin: string) {
  if (["ready", "canceled", "refunded"].includes(row.status)) return { ...(await reconcile(row)), confirmationUrl: null };
  const payment = await createTestCheckout(config(origin), { id: row.id, productId: row.product_id, amountMinor: row.amount_minor, merchantId: "1511648", currency: "RUB", testMode: true }, row.idempotency_key);
  // A response lost after creation can safely be retried with the persisted key.
  const sql = db();
  await sql.query("UPDATE aurora_test_checkout SET payment_id=$2,confirmation_url=$3,status='pending' WHERE id=$1 AND status IN ('creating','pending') AND (payment_id IS NULL OR payment_id=$2::uuid)", [row.id, payment.paymentId, payment.confirmationUrl]);
  return { id: row.id, status: "pending", test: true, confirmationUrl: payment.confirmationUrl, amountMinor: row.amount_minor };
}
export async function findOrder(id: string, token: string) {
  if (!uuid.test(id)) return null;
  const rows = await db().query("SELECT * FROM aurora_test_checkout WHERE id=$1 AND session_hash=$2 AND expires_at>now()", [id, digest(token)]);
  return (rows[0] as CheckoutRow | undefined) || null;
}
export async function reconcile(row: CheckoutRow) {
  if (row.status === "refunded" || row.status === "canceled" || !row.payment_id) return publicOrder(row);
  const order = createOrder({ id: row.id, productId: row.product_id, amountMinor: row.amount_minor, currency: "RUB", merchantId: "1511648", testMode: true, paymentId: row.payment_id });
  try { await verifyTestPayment(config(), order); }
  catch (e) {
    if (e instanceof PaymentError && ["PAYMENT_CANCELED", "PAYMENT_REFUNDED"].includes(e.code)) {
      const status = e.code === "PAYMENT_CANCELED" ? "canceled" : "refunded";
      await db().query("UPDATE aurora_test_checkout SET status=$2 WHERE id=$1 AND payment_id=$3", [row.id, status, row.payment_id]);
      return publicOrder({ ...row, status });
    }
    if (e instanceof PaymentError && e.code === "PAYMENT_NOT_SUCCEEDED") return { ...publicOrder({ ...row, status: "pending" }), report: null };
    throw e;
  }
  // Synchronous, precomputed report: payment verification and availability are
  // committed in one UPDATE. No asynchronous generation job can be lost.
  const updated = await db().query("UPDATE aurora_test_checkout SET status='ready',paid_verified_at=coalesce(paid_verified_at,now()) WHERE id=$1 AND payment_id=$2 AND status IN ('pending','ready') AND expires_at>now() RETURNING *", [row.id, row.payment_id]);
  if (!updated.length) throw new PaymentError("ORDER_STATE_CONFLICT");
  return publicOrder(updated[0] as CheckoutRow);
}
export async function webhookPayment(paymentId: string) {
  if (!uuid.test(paymentId)) throw new PaymentError("INVALID_REQUEST");
  const rows = await db().query("SELECT * FROM aurora_test_checkout WHERE payment_id=$1 AND expires_at>now()", [paymentId]);
  if (rows[0]) await reconcile(rows[0] as CheckoutRow);
}
export function failure(error: unknown) {
  if (error instanceof NatalError) return Response.json({ message: error.message, code: error.code }, { status: 422, headers: cacheHeaders });
  const code = error instanceof PaymentError ? error.code : "CHECKOUT_UNAVAILABLE";
  const message = code === "TEST_RATE_LIMIT" ? "Достигнут лимит тестовых заказов. Повторите через час." : code === "NOT_CONFIGURED" ? "Тестовая касса ещё настраивается." : "Не удалось завершить операцию. Повторите попытку — существующий заказ сохранён.";
  return Response.json({ code, message }, { status: code === "TEST_RATE_LIMIT" ? 429 : 503, headers: cacheHeaders });
}
