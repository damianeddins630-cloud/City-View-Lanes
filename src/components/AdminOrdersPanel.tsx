"use client";

import { useCallback, useEffect, useState } from "react";
import { formatUsd } from "@/lib/money";
import type { OrderFulfillmentStatus, ShopOrder } from "@/lib/types";

type Props = {
  onNotice: (msg: string) => void;
  onError: (msg: string) => void;
};

function formatWhen(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function paymentLabel(status: ShopOrder["paymentStatus"]) {
  switch (status) {
    case "paid":
      return "Paid";
    case "pending":
      return "Pending";
    case "failed":
      return "Failed";
    case "cancelled":
      return "Cancelled";
    case "refunded":
      return "Refunded";
    default:
      return status;
  }
}

export default function AdminOrdersPanel({ onNotice, onError }: Props) {
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ShopOrder | null>(null);
  const [savingId, setSavingId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (!res.ok) {
        onError(data.error || "Could not load orders.");
        return;
      }
      setOrders(data.orders || []);
    } catch {
      onError("Could not load orders.");
    } finally {
      setLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    void load();
  }, [load]);

  async function updateFulfillment(order: ShopOrder, fulfillmentStatus: OrderFulfillmentStatus) {
    setSavingId(order.id);
    onError("");
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order.id, fulfillmentStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error || "Could not update fulfillment.");
        return;
      }
      setOrders(data.orders || []);
      if (selected?.id === order.id) {
        const next = (data.orders || []).find((o: ShopOrder) => o.id === order.id);
        setSelected(next || null);
      }
      onNotice(`Order ${order.id} marked ${fulfillmentStatus}.`);
    } catch {
      onError("Could not update fulfillment.");
    } finally {
      setSavingId("");
    }
  }

  if (loading) {
    return <p className="mt-6 text-sm text-[var(--muted)]">Loading orders…</p>;
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-[var(--ink)]">Pro Shop orders</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Orders start on this website and are paid through Shopify checkout.
          </p>
        </div>
        <button type="button" className="btn btn-ghost text-[10px]" onClick={() => void load()}>
          Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No orders yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-xs tracking-wide text-[var(--blue)] uppercase">
                <th className="py-2 pr-3 font-semibold">Order ID</th>
                <th className="py-2 pr-3 font-semibold">Customer</th>
                <th className="py-2 pr-3 font-semibold">Products</th>
                <th className="py-2 pr-3 font-semibold">Total</th>
                <th className="py-2 pr-3 font-semibold">Payment</th>
                <th className="py-2 pr-3 font-semibold">Fulfillment</th>
                <th className="py-2 pr-3 font-semibold">Date</th>
                <th className="py-2 font-semibold"> </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-[var(--line)] align-top">
                  <td className="py-3 pr-3 font-mono text-xs text-[var(--ink)]">
                    {order.id}
                    {order.shopifyOrderId ? (
                      <p className="mt-1 text-[10px] text-[var(--muted)]">
                        Shopify #{order.shopifyOrderId}
                      </p>
                    ) : null}
                  </td>
                  <td className="py-3 pr-3">
                    <p className="font-semibold text-[var(--ink)]">{order.customerName}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {order.customerEmail || "No email yet"}
                    </p>
                  </td>
                  <td className="py-3 pr-3">
                    <ul className="space-y-1">
                      {order.lineItems.map((item, idx) => (
                        <li key={`${order.id}-${item.productId}-${idx}`}>
                          {item.name}{" "}
                          <span className="text-[var(--muted)]">× {item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="py-3 pr-3 font-semibold text-[var(--ink)]">
                    {formatUsd(order.totalCents)}
                  </td>
                  <td className="py-3 pr-3">
                    <span
                      className={
                        order.paymentStatus === "paid"
                          ? "font-semibold text-emerald-700"
                          : order.paymentStatus === "failed"
                            ? "font-semibold ice-error"
                            : "text-[var(--muted)]"
                      }
                    >
                      {paymentLabel(order.paymentStatus)}
                    </span>
                  </td>
                  <td className="py-3 pr-3">
                    <select
                      className="max-w-[140px] text-xs"
                      value={order.fulfillmentStatus}
                      disabled={savingId === order.id}
                      onChange={(e) =>
                        void updateFulfillment(
                          order,
                          e.target.value as OrderFulfillmentStatus,
                        )
                      }
                    >
                      <option value="unfulfilled">Unfulfilled</option>
                      <option value="partial">Partial</option>
                      <option value="fulfilled">Fulfilled</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-3 pr-3 text-xs text-[var(--muted)]">
                    {formatWhen(order.paidAt || order.createdAt)}
                  </td>
                  <td className="py-3">
                    <button
                      type="button"
                      className="btn btn-ghost text-[10px]"
                      onClick={() => setSelected(order)}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--black)]/60 p-3 sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Order details"
          onClick={() => setSelected(null)}
        >
          <div
            className="panel max-h-[90vh] w-full max-w-2xl overflow-y-auto p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-wide text-[var(--blue)] uppercase">
                  Order details
                </p>
                <h3 className="font-display text-2xl text-[var(--ink)]">{selected.id}</h3>
              </div>
              <button
                type="button"
                className="btn btn-ghost text-[10px]"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold text-[var(--blue)]">Customer:</span>{" "}
                {selected.customerName}
              </p>
              <p>
                <span className="font-semibold text-[var(--blue)]">Email:</span>{" "}
                {selected.customerEmail || "—"}
              </p>
              <p>
                <span className="font-semibold text-[var(--blue)]">Payment:</span>{" "}
                {paymentLabel(selected.paymentStatus)}
              </p>
              <p>
                <span className="font-semibold text-[var(--blue)]">Fulfillment:</span>{" "}
                {selected.fulfillmentStatus}
              </p>
              <p>
                <span className="font-semibold text-[var(--blue)]">Order date:</span>{" "}
                {formatWhen(selected.createdAt)}
              </p>
              <p>
                <span className="font-semibold text-[var(--blue)]">Paid at:</span>{" "}
                {formatWhen(selected.paidAt)}
              </p>
              <p>
                <span className="font-semibold text-[var(--blue)]">Shopify draft:</span>{" "}
                {selected.shopifyDraftOrderId || "—"}
              </p>
              <p>
                <span className="font-semibold text-[var(--blue)]">Shopify order:</span>{" "}
                {selected.shopifyOrderId || "—"}
              </p>
              <p>
                <span className="font-semibold text-[var(--blue)]">Total:</span>{" "}
                {formatUsd(selected.totalCents)} {selected.currency}
              </p>
              <div className="pt-2">
                <p className="font-semibold text-[var(--blue)]">Products</p>
                <ul className="mt-2 space-y-2">
                  {selected.lineItems.map((item, idx) => (
                    <li
                      key={`${selected.id}-d-${item.productId}-${idx}`}
                      className="border-b border-[var(--line)] pb-2"
                    >
                      {item.name} × {item.quantity} — {formatUsd(item.unitPriceCents)} each
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
