"use client";

import { useState } from "react";
import { Truck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { arrangeDelivery } from "../actions";
import type { Order } from "./schema";

interface ArrangeDeliveryButtonProps {
  order: Order;
}

export function ArrangeDeliveryButton({ order }: ArrangeDeliveryButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleArrangeDelivery = async (carrier: "gel") => {
    setIsLoading(true);

    const deliveryPromise = arrangeDelivery(order.id, carrier);

    toast.promise(deliveryPromise, {
      loading: `Arranging delivery with ${carrier.toUpperCase()}...`,
      success: (result) => {
        if (result.success && result.shipmentNumber) {
          // Optionally refresh the page or update the UI
          // window.location.reload();
          return `Delivery arranged! Shipment number: ${result.shipmentNumber}`;
        }
        throw new Error(result.error || "Failed to arrange delivery");
      },
      error: (err) => {
        return err.message || "Failed to arrange delivery";
      },
    });

    try {
      await deliveryPromise;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isLoading}>
          <Truck className="h-4 w-4" />
          Arrange Delivery
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Select Carrier</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleArrangeDelivery("gel")}>
          GEL Express
        </DropdownMenuItem>
        {/* Add more carriers here as they become available */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

