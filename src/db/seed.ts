import { and, eq } from "drizzle-orm";

import data from "../app/(main)/dashboard/orders/_components/data.json";
import { db } from "./index";
import { order } from "./schema";

async function seed() {
  console.log("Seeding database with initial order data...");

  try {
    let inserted = 0;
    let skipped = 0;

    // Insert initial orders from data.json
    for (const orderData of data) {
      try {
        // Check if order already exists
        const existing = await db
          .select()
          .from(order)
          .where(and(eq(order.externalOrderId, orderData.externalOrderId), eq(order.provider, orderData.provider)))
          .limit(1);

        if (existing.length > 0) {
          console.log(`  Skipping existing order: ${orderData.externalOrderId}`);
          skipped++;
          continue;
        }

        await db.insert(order).values({
          id: orderData.id,
          externalOrderId: orderData.externalOrderId,
          provider: orderData.provider,
          customerName: orderData.customerName,
          productName: orderData.productName,
          quantity: orderData.quantity,
          totalAmount: orderData.totalAmount,
          orderDate: new Date(orderData.orderDate),
          deliveryStatus: orderData.deliveryStatus,
          shippingAddress: orderData.shippingAddress,
          trackingNumber: orderData.trackingNumber || "",
        });
        console.log(`  ✓ Inserted order: ${orderData.externalOrderId}`);
        inserted++;
      } catch (err) {
        console.error(`  ✗ Failed to insert order ${orderData.externalOrderId}:`, err instanceof Error ? err.message : err);
      }
    }

    console.log(`\n✓ Seeding completed! Inserted: ${inserted}, Skipped: ${skipped}`);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
