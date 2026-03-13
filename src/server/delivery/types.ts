export type Carrier = "gel" | "dhl" | "dpd"

export interface DeliveryLabel {
    data: Buffer
}

export interface DeliveryResult {
    shipmentNumber: string
    labels: DeliveryLabel[]
}

export interface DeliveryServiceConfig {
    carrier: Carrier
}

export interface CreateDeliveryOrderParams {
    orderId: string
    sender: Address
    receiver: Address
    parcels: Parcel[]
}

export interface Address {
    name1: string
    name2?: string
    street: string
    zipcode: string
    town: string
    country: string
}

export interface Parcel {
    weight?: number
    length?: number
    width?: number
    height?: number
    description?: string
}
