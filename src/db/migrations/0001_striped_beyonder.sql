CREATE TABLE "order" (
	"id" text PRIMARY KEY NOT NULL,
	"orderId" text NOT NULL,
	"provider" text NOT NULL,
	"customerName" text NOT NULL,
	"productName" text NOT NULL,
	"quantity" integer NOT NULL,
	"totalAmount" double precision NOT NULL,
	"orderDate" timestamp NOT NULL,
	"deliveryStatus" text NOT NULL,
	"shippingAddress" text NOT NULL,
	"trackingNumber" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "order_orderId_provider_unique" UNIQUE("orderId","provider")
);
