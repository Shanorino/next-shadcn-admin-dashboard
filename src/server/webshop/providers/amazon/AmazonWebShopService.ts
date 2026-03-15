import {AmazonConfig, AmazonOrder} from "./types"
import { SellingPartner } from "amazon-sp-api"
import { WebShopOrderDTO, WebShopService } from "@/server/webshop/WebShopService";

export class AmazonWebShopService extends WebShopService {
    private spClient: SellingPartner

    constructor(private config: AmazonConfig) {
        super()

        this.spClient = new SellingPartner({
            region: config.region ?? "eu",

            refresh_token: config.refreshToken,

            credentials: {
                SELLING_PARTNER_APP_CLIENT_ID:
                    process.env.SELLING_PARTNER_APP_CLIENT_ID!,

                SELLING_PARTNER_APP_CLIENT_SECRET:
                    process.env.SELLING_PARTNER_APP_CLIENT_SECRET!
            },

            options: {
                use_sandbox: config.sandbox ?? false,
                debug_log: true,
            }
        })
    }

    async fetchOrders(): Promise<WebShopOrderDTO[]> {
        const amazonOrders = await this.fetchAmazonOrders()

        return amazonOrders.map(this.convertOrder)
    }

    private async fetchAmazonOrders(): Promise<any[]> {

        const res = await this.spClient.callAPI({
            endpoint: "orders",
            operation: "getOrders",

            query: {
                MarketplaceIds: ["A1PA6795UKMFR9"], // Germany
                CreatedAfter: new Date(
                    Date.now() - 7 * 24 * 3600 * 1000
                ).toISOString(),
            }
        })

        return res?.payload?.Orders ?? []
    }

    private async fetchAmazonOrdersMocked(): Promise<AmazonOrder[]> {
        await new Promise((resolve) => setTimeout(resolve, 1500))

        return [
            {
                AmazonOrderId: "AMZ-2026-001299",
                PurchaseDate: "2026-03-09T14:30:00Z",
                BuyerInfo: { BuyerName: "Alice Thompson" },
                OrderTotal: { Amount: "129.99", CurrencyCode: "USD" },
                ShipmentStatus: "Not-Delivered",
                ShippingAddress: {
                    Name: "Alice Thompson",
                    AddressLine1: "742 Evergreen Terrace",
                    City: "Springfield",
                    StateOrRegion: "IL",
                    PostalCode: "62701",
                },
                OrderItems: [
                    { Title: "Smart Watch", QuantityOrdered: 1 }
                ],
                TrackingNumber: ""
            }
        ]
    }

    private convertOrder(order: AmazonOrder): WebShopOrderDTO {

        const address = [
            order.ShippingAddress.AddressLine1,
            order.ShippingAddress.City,
            order.ShippingAddress.StateOrRegion,
            order.ShippingAddress.PostalCode,
        ].join(", ")

        return {
            externalOrderId: order.AmazonOrderId,
            provider: "amazon",
            customerName: order.BuyerInfo.BuyerName,
            productName: order.OrderItems.map(i => i.Title).join(", "),
            quantity: order.OrderItems.reduce((sum, i) => sum + i.QuantityOrdered, 0),
            totalAmount: parseFloat(order.OrderTotal.Amount),
            orderDate: order.PurchaseDate,
            deliveryStatus:
                // TODO: check amazon type if it's really called "Delivered" or "Not-Delivered"
                order.ShipmentStatus === "Delivered"
                    ? "delivered"
                    : "not-delivered",
            shippingAddress: address,
            trackingNumber: order.TrackingNumber ?? ""
        }
    }
}
