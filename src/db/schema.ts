import { boolean, doublePrecision, integer, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  email_verified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expires_at: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
  ip_address: text("ip_address"),
  user_agent: text("user_agent"),
  user_id: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  account_id: text("account_id").notNull(),
  provider_id: text("provider_id").notNull(),
  user_id: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  access_token: text("access_token"),
  refresh_token: text("refresh_token"),
  id_token: text("id_token"),
  access_token_expires_at: timestamp("access_token_expires_at"),
  refresh_token_expires_at: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expires_at: timestamp("expires_at").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const order = pgTable(
  "order",
  {
    id: text("id").primaryKey(),
    external_order_id: text("external_order_id").notNull(), // External order ID from provider (Amazon, Shopify, etc.)
    provider: text("provider").notNull(), // e.g., "Amazon", "eBay", etc.
    customer_name: text("customer_name").notNull(),
    product_name: text("product_name").notNull(),
    quantity: integer("quantity").notNull(),
    total_amount: doublePrecision("total_amount").notNull(),
    order_date: timestamp("order_date").notNull(),
    delivery_status: text("delivery_status").notNull(), // "delivered" or "not-delivered"
    shipping_address: text("shipping_address").notNull(),
    tracking_number: text("tracking_number"),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    // Composite unique constraint: external_order_id + provider must be unique
    orderProviderUnique: unique().on(table.external_order_id, table.provider),
  }),
);

export const shippingShipment = pgTable("shipping_shipment", {
    id: text("id").primaryKey(),
    order_id: text("order_id").notNull(),
    carrier: text("carrier").notNull(),
    shipment_number: text("shipment_number").notNull().unique(),
    status: text("status").notNull().default("created"),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at").notNull().defaultNow(),
})

export const shippingDocument = pgTable("shipping_document", {
    id: text("id").primaryKey(),
    shipment_id: text("shipment_id")
        .notNull()
        .references(() => shippingShipment.id, { onDelete: "cascade" }),
    document_type: text("document_type").notNull(), // "label"
    storage_key: text("storage_key").notNull(), // path to stored file
    mime_type: text("mime_type").notNull().default("application/pdf"),
    created_at: timestamp("created_at").notNull().defaultNow(),
})
