"use server";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { order, shippingShipment, shippingDocument } from "@/db/schema";
import { DeliveryFactory } from "@/server/delivery/DeliveryFactory";
import type { Carrier, CreateDeliveryOrderParams } from "@/server/delivery/types";
import { resolveStorageKeyToUrl, extractFilenameFromStorageKey } from "@/lib/storage";

import type { Order } from "./_components/schema";

// Mock Amazon API response type
interface AmazonOrder {
  AmazonOrderId: string;
  PurchaseDate: string;
  BuyerInfo: {
    BuyerName: string;
  };
  OrderTotal: {
    Amount: string;
    CurrencyCode: string;
  };
  ShipmentStatus: string;
  ShippingAddress: {
    Name: string;
    AddressLine1: string;
    City: string;
    StateOrRegion: string;
    PostalCode: string;
  };
  OrderItems: Array<{
    Title: string;
    QuantityOrdered: number;
  }>;
  TrackingNumber?: string;
}

// Mock function to simulate Amazon Seller API call
async function fetchAmazonOrders(_apiKey: string): Promise<AmazonOrder[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Mock Amazon API response
  return [
    {
      AmazonOrderId: "AMZ-2026-001242",
      PurchaseDate: "2026-03-09T14:30:00Z",
      BuyerInfo: {
        BuyerName: "Alice Thompson",
      },
      OrderTotal: {
        Amount: "129.99",
        CurrencyCode: "USD",
      },
      ShipmentStatus: "Shipped",
      ShippingAddress: {
        Name: "Alice Thompson",
        AddressLine1: "742 Evergreen Terrace",
        City: "Springfield",
        StateOrRegion: "IL",
        PostalCode: "62701",
      },
      OrderItems: [
        {
          Title: "Smart Watch",
          QuantityOrdered: 1,
        },
      ],
      TrackingNumber: "1Z999AA10123456790",
    },
    {
      AmazonOrderId: "AMZ-2026-001243",
      PurchaseDate: "2026-03-09T16:45:00Z",
      BuyerInfo: {
        BuyerName: "Bob Martinez",
      },
      OrderTotal: {
        Amount: "249.97",
        CurrencyCode: "USD",
      },
      ShipmentStatus: "Pending",
      ShippingAddress: {
        Name: "Bob Martinez",
        AddressLine1: "1600 Pennsylvania Ave",
        City: "Washington",
        StateOrRegion: "DC",
        PostalCode: "20500",
      },
      OrderItems: [
        {
          Title: "Mechanical Keyboard",
          QuantityOrdered: 3,
        },
      ],
    },
  ];
}

// Convert Amazon order to our unified DTO
function convertAmazonOrderToDTO(amazonOrder: AmazonOrder): Omit<Order, "id"> & { id?: string } {
  const addressParts = [
    amazonOrder.ShippingAddress.AddressLine1,
    amazonOrder.ShippingAddress.City,
    amazonOrder.ShippingAddress.StateOrRegion,
    amazonOrder.ShippingAddress.PostalCode,
  ];

  return {
    externalOrderId: amazonOrder.AmazonOrderId,
    provider: "Amazon",
    customerName: amazonOrder.BuyerInfo.BuyerName,
    productName: amazonOrder.OrderItems.map((item) => item.Title).join(", "),
    quantity: amazonOrder.OrderItems.reduce((sum, item) => sum + item.QuantityOrdered, 0),
    totalAmount: Number.parseFloat(amazonOrder.OrderTotal.Amount),
    orderDate: amazonOrder.PurchaseDate,
    deliveryStatus: amazonOrder.ShipmentStatus === "Delivered" ? "delivered" : "not-delivered",
    shippingAddress: addressParts.join(", "),
    trackingNumber: amazonOrder.TrackingNumber || "",
  };
}

export async function syncOrdersFromAmazon(): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    // Get API key from environment variable
    const apiKey = process.env.AMAZON_SELLER_API_KEY;

    if (!apiKey) {
      throw new Error("Amazon Seller API key not configured");
    }

    // Fetch orders from Amazon API (mocked)
    const amazonOrders = await fetchAmazonOrders(apiKey);

    // Convert to our unified DTO
    const orderDTOs = amazonOrders.map(convertAmazonOrderToDTO);

    // Upsert orders to database
    let upsertCount = 0;
    for (const orderDTO of orderDTOs) {
      // Check if order exists
      const existingOrder = await db
        .select()
        .from(order)
        .where(and(eq(order.externalOrderId, orderDTO.externalOrderId), eq(order.provider, orderDTO.provider)))
        .limit(1);

      if (existingOrder.length > 0) {
        // Update existing order with data from Amazon API (source of truth)
        await db
          .update(order)
          .set({
            customerName: orderDTO.customerName,
            productName: orderDTO.productName,
            quantity: orderDTO.quantity,
            totalAmount: orderDTO.totalAmount,
            orderDate: new Date(orderDTO.orderDate),
            deliveryStatus: orderDTO.deliveryStatus,
            shippingAddress: orderDTO.shippingAddress,
            trackingNumber: orderDTO.trackingNumber,
            updatedAt: new Date(),
          })
          .where(and(eq(order.externalOrderId, orderDTO.externalOrderId), eq(order.provider, orderDTO.provider)));
      } else {
        // Insert new order
        await db.insert(order).values({
          id: crypto.randomUUID(),
          externalOrderId: orderDTO.externalOrderId,
          provider: orderDTO.provider,
          customerName: orderDTO.customerName,
          productName: orderDTO.productName,
          quantity: orderDTO.quantity,
          totalAmount: orderDTO.totalAmount,
          orderDate: new Date(orderDTO.orderDate),
          deliveryStatus: orderDTO.deliveryStatus,
          shippingAddress: orderDTO.shippingAddress,
          trackingNumber: orderDTO.trackingNumber || "",
        });
      }
      upsertCount++;
    }

    return {
      success: true,
      count: upsertCount,
    };
  } catch (error) {
    console.error("Error syncing orders from Amazon:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function getOrders(): Promise<Order[]> {
  try {
    const orders = await db.select().from(order).orderBy(order.orderDate);

    // Convert database records to Order type
    return orders.map((o) => ({
      id: o.id,
      externalOrderId: o.externalOrderId,
      provider: o.provider,
      customerName: o.customerName,
      productName: o.productName,
      quantity: o.quantity,
      totalAmount: o.totalAmount,
      orderDate: o.orderDate.toISOString(),
      deliveryStatus: o.deliveryStatus as "delivered" | "not-delivered",
      shippingAddress: o.shippingAddress,
      trackingNumber: o.trackingNumber || "",
    }));
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}

export async function arrangeDelivery(
  orderId: string,
  carrier: Carrier
): Promise<{ success: boolean; shipmentNumber?: string; error?: string }> {
  try {
    // Fetch the order from database
    const orderRecord = await db.select().from(order).where(eq(order.id, orderId)).limit(1);

    if (orderRecord.length === 0) {
      throw new Error("Order not found");
    }

    const orderData = orderRecord[0];

    // Create delivery service instance using factory
    const deliveryService = DeliveryFactory.create(carrier);

    // TODO: Implement complex logic to construct CreateDeliveryOrderParams
    // This should parse the order data and construct the proper delivery parameters
    // For now, using a placeholder structure
    const deliveryParams: CreateDeliveryOrderParams = {
      orderId: orderData.id,
      sender: {
        // TODO: Get actual sender information from configuration or database
        name1: "Your Company Name",
        street: "Your Street",
        zipcode: "12345",
        town: "Your City",
        country: "D",
      },
      receiver: {
        // TODO: Parse shippingAddress field to extract proper address components
        // Current shippingAddress is a single string, needs to be parsed
        name1: orderData.customerName,
        street: orderData.shippingAddress, // TODO: Extract street from shippingAddress
        zipcode: "00000", // TODO: Extract zipcode from shippingAddress
        town: "City", // TODO: Extract town from shippingAddress
        country: "D", // TODO: Determine country from shippingAddress
      },
      parcels: [
        {
          weight: 5, // TODO: Calculate weight based on product
          // TODO: Add dimensions if available
        },
      ],
    };

    // Call the delivery service to create the delivery order
    // const result = await deliveryService.createDeliveryOrder(deliveryParams);

    // Update order with tracking number if available
    // if (result.shipmentNumber) {
    //   await db
    //     .update(order)
    //     .set({
    //       trackingNumber: result.shipmentNumber,
    //       updatedAt: new Date(),
    //     })
    //     .where(eq(order.id, orderId));
    // }

    return {
      success: true,
      shipmentNumber: "GEL_Shipment_0001",//result.shipmentNumber,
    };
  } catch (error) {
    console.error("Error arranging delivery:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function downloadDeliveryLabel(
  orderId: string
): Promise<{ success: boolean; fileUrl?: string; fileName?: string; error?: string }> {
  try {
    // Find the shipment for this order
    const shipmentRecord = await db
      .select()
      .from(shippingShipment)
      .where(eq(shippingShipment.orderId, orderId))
      .limit(1);

    if (shipmentRecord.length === 0) {
      throw new Error("No shipment found for this order");
    }

    const shipment = shipmentRecord[0];

    // Find the shipping document (label) for this shipment
    const documentRecord = await db
      .select()
      .from(shippingDocument)
      .where(eq(shippingDocument.shipmentId, shipment.id))
      .limit(1);

    if (documentRecord.length === 0) {
      throw new Error("No delivery label found for this shipment");
    }

    const document = documentRecord[0];

    // Use storage utility to resolve storage key to URL
    // This allows easy migration to cloud storage in the future
    const fileUrl = resolveStorageKeyToUrl(document.storageKey);
    const filename = extractFilenameFromStorageKey(document.storageKey);
    const fileName = `label-${shipment.shipmentNumber}.pdf`;

    return {
      success: true,
      fileUrl,
      fileName,
    };
  } catch (error) {
    console.error("Error downloading delivery label:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}


