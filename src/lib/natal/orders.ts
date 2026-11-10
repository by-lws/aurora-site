// Pure domain rules, not a database or payment verification endpoint.
// Persist transitions + outbox job atomically in a real database before launch.
export type OrderStatus = "awaiting_payment" | "queued" | "generating" | "ready" | "failed" | "canceled" | "refund_pending" | "refunded";
export type Order = { id: string; productId: "natal" | "relocation"; amountMinor: number; currency: "RUB"; merchantId: string; testMode: boolean; paymentId: string; status: OrderStatus; attempt: number; revision: number; jobKey: string | null; reportId: string | null };
export type VerifiedPayment = { verification: "provider-api"; id: string; orderId: string; merchantId: string; amountMinor: number; currency: string; testMode: boolean; status: "succeeded" };
export class OrderError extends Error { code: string; constructor(code: string) { super(code); this.code = code; } }
export function createOrder(input: Omit<Order, "status" | "attempt" | "revision" | "jobKey" | "reportId">): Order {
  if (!["natal", "relocation"].includes(input.productId) || !input.id || !input.paymentId || !input.merchantId || !Number.isSafeInteger(input.amountMinor) || input.amountMinor <= 0 || input.currency !== "RUB" || typeof input.testMode !== "boolean") throw new OrderError("INVALID_ORDER");
  return { ...input, status: "awaiting_payment", attempt: 0, revision: 0, jobKey: null, reportId: null };
}
export function confirmPayment(order: Order, payment: VerifiedPayment): { order: Order; enqueue: boolean } {
  // Caller must first fetch the payment from its authenticated provider API.
  // The marker below is only a contract, not a signature or remote verification.
  if (payment.verification !== "provider-api" || payment.status !== "succeeded" || payment.id !== order.paymentId || payment.orderId !== order.id || payment.merchantId !== order.merchantId || payment.amountMinor !== order.amountMinor || payment.currency !== order.currency || payment.testMode !== order.testMode) throw new OrderError("PAYMENT_MISMATCH");
  if (["queued", "generating", "ready", "failed", "refund_pending", "refunded"].includes(order.status)) return { order, enqueue: false };
  if (order.status !== "awaiting_payment") throw new OrderError("PAYMENT_RECONCILIATION_REQUIRED");
  return { order: { ...order, status: "queued", revision: order.revision + 1, jobKey: `natal:${order.id}:${order.paymentId}` }, enqueue: true };
}
export function beginGeneration(order: Order, jobKey: string): Order {
  if (order.status !== "queued" || order.jobKey !== jobKey || order.attempt >= 3) throw new OrderError("INVALID_JOB");
  return { ...order, status: "generating", revision: order.revision + 1, attempt: order.attempt + 1 };
}
export function completeGeneration(order: Order, jobKey: string, attempt: number, reportId: string): Order {
  if (order.status !== "generating" || order.jobKey !== jobKey || order.attempt !== attempt || !reportId) throw new OrderError("INVALID_COMPLETION");
  return { ...order, status: "ready", revision: order.revision + 1, reportId };
}
export function failGeneration(order: Order, jobKey: string, attempt: number): Order {
  if (order.status !== "generating" || order.jobKey !== jobKey || order.attempt !== attempt) throw new OrderError("INVALID_FAILURE");
  return { ...order, status: "failed", revision: order.revision + 1 };
}
export function retryGeneration(order: Order): Order {
  if (order.status !== "failed" || order.attempt >= 3) throw new OrderError("RETRY_LIMIT");
  return { ...order, status: "queued", revision: order.revision + 1 };
}
export function cancelUnpaidOrder(order: Order): Order {
  if (order.status !== "awaiting_payment") throw new OrderError("INVALID_CANCEL");
  return { ...order, status: "canceled", revision: order.revision + 1 };
}
export function requestRefund(order: Order): Order {
  if (!["queued", "failed", "ready"].includes(order.status)) throw new OrderError("INVALID_REFUND");
  return { ...order, status: "refund_pending", revision: order.revision + 1 };
}
export function confirmRefund(order: Order, providerConfirmed: boolean): Order {
  if (order.status !== "refund_pending" || providerConfirmed !== true) throw new OrderError("INVALID_REFUND_CONFIRMATION");
  return { ...order, status: "refunded", revision: order.revision + 1, reportId: null };
}
export interface OrderStore {
  read(id: string): Promise<Order | null>;
  // Transaction: compare revision, save order AND insert unique outbox job.
  // A failed compare must write neither record. No in-memory production store.
  commitWithOutbox(order: Order, expectedRevision: number, jobKey: string | null): Promise<boolean>;
}
export async function handleVerifiedPayment(store: OrderStore, orderId: string, payment: VerifiedPayment) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const current = await store.read(orderId);
    if (!current) throw new OrderError("ORDER_NOT_FOUND");
    const result = confirmPayment(current, payment);
    if (!result.enqueue) return result;
    if (await store.commitWithOutbox(result.order, current.revision, result.order.jobKey)) return result;
  }
  throw new OrderError("CONCURRENT_UPDATE_RETRY_REQUIRED");
}
