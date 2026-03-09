"use server";

import type { Order } from "../_components/schema";

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
function convertAmazonOrderToDTO(amazonOrder: AmazonOrder): Order {
  const addressParts = [
    amazonOrder.ShippingAddress.AddressLine1,
    amazonOrder.ShippingAddress.City,
    amazonOrder.ShippingAddress.StateOrRegion,
    amazonOrder.ShippingAddress.PostalCode,
  ];

  return {
    id: crypto.randomUUID(),
    orderId: amazonOrder.AmazonOrderId,
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

export async function syncOrdersFromAmazon(): Promise<{ success: boolean; orders?: Order[]; error?: string }> {
  try {
    // Get API key from environment variable
    const apiKey = process.env.AMAZON_SELLER_API_KEY;

    if (!apiKey) {
      throw new Error("Amazon Seller API key not configured");
    }

    // Fetch orders from Amazon API (mocked)
    const amazonOrders = await fetchAmazonOrders(apiKey);

    // Convert to our unified DTO
    const orders = amazonOrders.map(convertAmazonOrderToDTO);

    // TODO: In the future, save orders to database using Prisma
    // Example:
    // await prisma.order.createMany({
    //   data: orders,
    //   skipDuplicates: true,
    // });

    return {
      success: true,
      orders,
    };
  } catch (error) {
    console.error("Error syncing orders from Amazon:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
