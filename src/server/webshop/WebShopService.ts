export interface WebShopOrderDTO {
    externalOrderId: string
    provider: string
    customerName: string
    productName: string
    quantity: number
    totalAmount: number
    orderDate: string
    deliveryStatus: "delivered" | "not-delivered"
    shippingAddress: string
    trackingNumber?: string
}

export abstract class WebShopService {
    abstract fetchOrders(): Promise<WebShopOrderDTO[]>
}
