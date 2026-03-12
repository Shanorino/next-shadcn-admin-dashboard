import { Address, Parcel } from "../../types"

export interface GelConfig {
    apiKey: string
    depot: number
    knr: number
}

export interface GelShipmentRequest {
    sender: Address
    receiver: Address
    parcels: Parcel[]
    service: string
    shippingDate?: string
}

export interface GelApiResponse {
    shipmentNumber: string
    labels: Buffer[]
}
