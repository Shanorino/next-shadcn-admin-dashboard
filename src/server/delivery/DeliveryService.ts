import {
    CreateDeliveryOrderParams,
    DeliveryResult
} from "./types"

export abstract class DeliveryService {
    abstract createDeliveryOrder(
        params: CreateDeliveryOrderParams
    ): Promise<DeliveryResult>
}
