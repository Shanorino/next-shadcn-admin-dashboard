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
          .where(and(eq(order.external_order_id, orderData.orderId), eq(order.provider, orderData.provider)))
          .limit(1);

        if (existing.length > 0) {
          console.log(`  Skipping existing order: ${orderData.orderId}`);
          skipped++;
          continue;
        }

        await db.insert(order).values({
          id: orderData.id,
          external_order_id: orderData.orderId,
          provider: orderData.provider,
          customer_name: orderData.customerName,
          product_name: orderData.productName,
          quantity: orderData.quantity,
          total_amount: orderData.totalAmount,
          order_date: new Date(orderData.orderDate),
          delivery_status: orderData.deliveryStatus,
          shipping_address: orderData.shippingAddress,
          tracking_number: orderData.trackingNumber || "",
        });
        console.log(`  ✓ Inserted order: ${orderData.orderId}`);
        inserted++;
      } catch (err) {
        console.error(`  ✗ Failed to insert order ${orderData.orderId}:`, err instanceof Error ? err.message : err);
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
