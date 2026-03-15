import { OrderStatus } from "amazon-sp-api/lib/typings/operations/orders";

export interface AmazonConfig {
    refreshToken: string
    region?: "eu" | "na" | "fe"
    sandbox?: boolean
}

export interface AmazonOrder {
    AmazonOrderId: string
    PurchaseDate: string
    BuyerInfo: {
        BuyerName: string
    }
    OrderTotal: {
        Amount: string
        CurrencyCode: string
    }
    ShipmentStatus: OrderStatus
    ShippingAddress: {
        Name: string
        AddressLine1: string
        City: string
        StateOrRegion: string
        PostalCode: string
    }
    OrderItems: Array<{
        Title: string
        QuantityOrdered: number
    }>
    TrackingNumber?: string
}
