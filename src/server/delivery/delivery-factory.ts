import { DeliveryService } from "./delivery-service"
import { Carrier } from "./types"
import { GelDeliveryService } from "./providers/gel/gel-delivery-service"

export class DeliveryFactory {
    static create(carrier: Carrier): DeliveryService {
        switch (carrier) {
            case "gel":
                return new GelDeliveryService({
                    apiKey: process.env.GEL_API_KEY!,
                    depot: Number(process.env.GEL_DEPOT),
                    knr: Number(process.env.GEL_KNR),
                })

            default:
                throw new Error(`Unsupported carrier: ${carrier}`)
        }
    }
}
