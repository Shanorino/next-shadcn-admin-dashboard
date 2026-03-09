"use client";

import { useState } from "react";

import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import type { Order } from "../_components/schema";
import { syncOrdersFromAmazon } from "../actions";

export function SyncOrdersButton({ onSyncSuccess }: { onSyncSuccess: (orders: Order[]) => void }) {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    const syncPromise = syncOrdersFromAmazon();

    toast.promise(syncPromise, {
      loading: "Syncing orders from Amazon...",
      success: (result) => {
        if (result.success && result.orders) {
          onSyncSuccess(result.orders);
          return `Successfully synced ${result.orders.length} new orders!`;
        }
        throw new Error(result.error || "Failed to sync orders");
      },
      error: (err) => {
        return err.message || "Failed to sync orders";
      },
    });

    try {
      await syncPromise;
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button onClick={handleSync} disabled={isSyncing} size="sm">
      <RefreshCw className={isSyncing ? "animate-spin" : ""} />
      Sync Orders from Providers
    </Button>
  );
}
