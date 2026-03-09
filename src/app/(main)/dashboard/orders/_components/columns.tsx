import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { CircleCheck, EllipsisVertical, Package } from "lucide-react";
import type { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { DataTableColumnHeader } from "../../../../../components/data-table/data-table-column-header";
import type { orderSchema } from "./schema";

export const ordersColumns: ColumnDef<z.infer<typeof orderSchema>>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "orderId",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Order ID" />,
    cell: ({ row }) => <div className="font-medium">{row.original.orderId}</div>,
    enableSorting: true,
  },
  {
    accessorKey: "provider",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Provider" />,
    cell: ({ row }) => (
      <Badge variant="outline" className="px-1.5 text-muted-foreground">
        {row.original.provider}
      </Badge>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "customerName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
    cell: ({ row }) => <div className="max-w-[200px] truncate">{row.original.customerName}</div>,
    enableSorting: true,
  },
  {
    accessorKey: "productName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Product" />,
    cell: ({ row }) => <div className="max-w-[250px] truncate">{row.original.productName}</div>,
    enableSorting: true,
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Qty" />,
    cell: ({ row }) => <div className="text-center">{row.original.quantity}</div>,
    enableSorting: true,
  },
  {
    accessorKey: "totalAmount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
    cell: ({ row }) => <div className="font-medium">${row.original.totalAmount.toFixed(2)}</div>,
    enableSorting: true,
  },
  {
    accessorKey: "orderDate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Order Date" />,
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">{format(new Date(row.original.orderDate), "MMM dd, yyyy")}</div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "deliveryStatus",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => (
      <Badge variant="outline" className="px-1.5">
        {row.original.deliveryStatus === "delivered" ? (
          <>
            <CircleCheck className="fill-green-500 stroke-border dark:fill-green-400" />
            <span className="text-green-700 dark:text-green-400">Delivered</span>
          </>
        ) : (
          <>
            <Package className="text-orange-500" />
            <span className="text-orange-700 dark:text-orange-400">Not Delivered</span>
          </>
        )}
      </Badge>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "trackingNumber",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tracking" />,
    cell: ({ row }) => (
      <div className="max-w-[150px] truncate text-muted-foreground text-sm">{row.original.trackingNumber || "—"}</div>
    ),
    enableSorting: false,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const order = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <EllipsisVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(order.orderId)}>
              Copy Order ID
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(order.trackingNumber || "")}>
              Copy Tracking Number
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Update Status</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
