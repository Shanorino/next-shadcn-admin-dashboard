"use client";

import { useState } from "react";

import data from "./_components/data.json";
import { DataTable } from "./_components/data-table";
import type { Order } from "./_components/schema";
import { SyncOrdersButton } from "./_components/sync-orders-button";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(data as Order[]);

  const handleSyncSuccess = (newOrders: Order[]) => {
    // Append new orders to existing ones
    setOrders((prevOrders) => [...newOrders, ...prevOrders]);
  };

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl tracking-tight">Orders</h1>
          <p className="text-muted-foreground text-sm">Manage and sync orders from different platforms</p>
        </div>
        <SyncOrdersButton onSyncSuccess={handleSyncSuccess} />
      </div>
      <DataTable data={orders} />
    </div>
  );
}
