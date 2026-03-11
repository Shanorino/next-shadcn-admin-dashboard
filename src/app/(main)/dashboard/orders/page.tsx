import { DataTable } from "./_components/data-table";
import { SyncOrdersButton } from "./_components/sync-orders-button";
import { getOrders } from "./actions";

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl tracking-tight">Orders</h1>
          <p className="text-muted-foreground text-sm">Manage and sync orders from different platforms</p>
        </div>
        <SyncOrdersButton />
      </div>
      <DataTable data={orders} />
    </div>
  );
}
