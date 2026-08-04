import { NextResponse } from "next/server";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { readStore, updateStore } from "@/lib/db";
import type { OrderFulfillmentStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const FULFILLMENT: OrderFulfillmentStatus[] = [
  "unfulfilled",
  "partial",
  "fulfilled",
  "cancelled",
];

export async function GET() {
  const user = await getCurrentUser();
  if (!hasPermission(user, "manage_orders")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const store = await readStore();
  const orders = [...store.shopOrders].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
  return NextResponse.json({ orders });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!hasPermission(user, "manage_orders")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const id = String(body.id || "").trim();
    if (!id) {
      return NextResponse.json({ error: "Order id required." }, { status: 400 });
    }

    const fulfillmentStatus = String(body.fulfillmentStatus || "").trim() as OrderFulfillmentStatus;
    if (!FULFILLMENT.includes(fulfillmentStatus)) {
      return NextResponse.json(
        { error: "Invalid fulfillment status." },
        { status: 400 },
      );
    }

    const { store } = await updateStore((s) => {
      const order = s.shopOrders.find((o) => o.id === id);
      if (!order) throw new Error("Order not found");
      order.fulfillmentStatus = fulfillmentStatus;
      order.updatedAt = new Date().toISOString();
    });

    const orders = [...store.shopOrders].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
    return NextResponse.json({ orders });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not update order.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
