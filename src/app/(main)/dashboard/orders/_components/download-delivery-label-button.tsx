"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { downloadDeliveryLabel } from "../actions";
import type { Order } from "./schema";

interface DownloadDeliveryLabelButtonProps {
  order: Order;
}

export function DownloadDeliveryLabelButton({ order }: DownloadDeliveryLabelButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);

    try {
      const result = await downloadDeliveryLabel(order.id);

      if (result.success && result.fileUrl) {
        // Create a temporary link and trigger download
        const link = document.createElement("a");
        link.href = result.fileUrl;
        link.download = result.fileName || `delivery-label-${order.orderId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Delivery label downloaded successfully");
      } else {
        toast.error(result.error || "Failed to download delivery label");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to download delivery label");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" disabled={isLoading} onClick={handleDownload}>
      <Download className="h-4 w-4" />
      Download Label
    </Button>
  );
}

