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
    ShipmentStatus: string
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
