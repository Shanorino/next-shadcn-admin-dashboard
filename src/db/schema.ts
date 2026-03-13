import { boolean, doublePrecision, integer, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const order = pgTable(
  "order",
  {
    id: text("id").primaryKey(),
    externalOrderId: text("external_order_id").notNull(), // External order ID from provider (Amazon, Shopify, etc.)
    provider: text("provider").notNull(), // e.g., "Amazon", "eBay", etc.
    customerName: text("customer_name").notNull(),
    productName: text("product_name").notNull(),
    quantity: integer("quantity").notNull(),
    totalAmount: doublePrecision("total_amount").notNull(),
    orderDate: timestamp("order_date").notNull(),
    deliveryStatus: text("delivery_status").notNull(), // "delivered" or "not-delivered"
    shippingAddress: text("shipping_address").notNull(),
    trackingNumber: text("tracking_number"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    // Composite unique constraint: external_order_id + provider must be unique
    orderProviderUnique: unique().on(table.externalOrderId, table.provider),
  }),
);

export const shippingShipment = pgTable("shipping_shipment", {
    id: text("id").primaryKey(),
    orderId: text("order_id").notNull(),
    carrier: text("carrier").notNull(),
    shipmentNumber: text("shipment_number").notNull().unique(),
    status: text("status").notNull().default("created"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const shippingDocument = pgTable("shipping_document", {
    id: text("id").primaryKey(),
    shipmentId: text("shipment_id")
        .notNull()
        .references(() => shippingShipment.id, { onDelete: "cascade" }),
    documentType: text("document_type").notNull(), // "label"
    storageKey: text("storage_key").notNull(), // path to stored file
    mimeType: text("mime_type").notNull().default("application/pdf"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
})
