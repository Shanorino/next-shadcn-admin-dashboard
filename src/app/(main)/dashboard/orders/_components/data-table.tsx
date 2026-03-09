"use client";
"use no memo";

import * as React from "react";

import type { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";

import { DataTable as DataTableNew } from "../../../../../components/data-table/data-table";
import { DataTablePagination } from "../../../../../components/data-table/data-table-pagination";
import { DataTableViewOptions } from "../../../../../components/data-table/data-table-view-options";
import { ordersColumns } from "./columns";
import type { orderSchema } from "./schema";

export function DataTable({ data: initialData }: { data: z.infer<typeof orderSchema>[] }) {
  const [data] = React.useState(() => initialData);
  const columns = ordersColumns;
  const table = useDataTableInstance({ data, columns, getRowId: (row) => row.id.toString() });

  // Filter data based on delivery status
  const deliveredOrders = React.useMemo(() => data.filter((order) => order.deliveryStatus === "delivered"), [data]);

  const notDeliveredOrders = React.useMemo(
    () => data.filter((order) => order.deliveryStatus === "not-delivered"),
    [data],
  );

  const deliveredTable = useDataTableInstance({
    data: deliveredOrders,
    columns,
    getRowId: (row) => row.id.toString(),
  });

  const notDeliveredTable = useDataTableInstance({
    data: notDeliveredOrders,
    columns,
    getRowId: (row) => row.id.toString(),
  });

  return (
    <Tabs defaultValue="not-delivered" className="w-full flex-col justify-start gap-6">
      <div className="flex items-center justify-between">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Select defaultValue="not-delivered">
          <SelectTrigger className="flex @4xl/main:hidden w-fit" size="sm" id="view-selector">
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="not-delivered">Not Delivered</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <TabsList className="@4xl/main:flex hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:px-1">
          <TabsTrigger value="not-delivered">
            Not Delivered <Badge variant="secondary">{notDeliveredOrders.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="delivered">
            Delivered <Badge variant="secondary">{deliveredOrders.length}</Badge>
          </TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <DataTableViewOptions table={table} />
        </div>
      </div>
      <TabsContent value="not-delivered" className="relative flex flex-col gap-4 overflow-auto">
        <div className="overflow-hidden rounded-lg border">
          <DataTableNew table={notDeliveredTable} columns={columns} />
        </div>
        <DataTablePagination table={notDeliveredTable} />
      </TabsContent>
      <TabsContent value="delivered" className="relative flex flex-col gap-4 overflow-auto">
        <div className="overflow-hidden rounded-lg border">
          <DataTableNew table={deliveredTable} columns={columns} />
        </div>
        <DataTablePagination table={deliveredTable} />
      </TabsContent>
    </Tabs>
  );
}
