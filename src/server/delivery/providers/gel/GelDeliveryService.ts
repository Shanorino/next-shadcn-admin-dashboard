import { DeliveryService } from "../../DeliveryService"
import {
    CreateDeliveryOrderParams,
    DeliveryResult
} from "../../types"

import { GelConfig } from "./types"
import { mkdir, writeFile } from "node:fs/promises"
import {randomUUID} from "node:crypto";
import {db} from "@/db";
import {shippingDocument, shippingShipment} from "@/db/schema";
import path from "node:path";

export class GelDeliveryService extends DeliveryService {
    private readonly baseUrl =
        "https://www.service.equicon.de/gel/api/import"

    private readonly fetcher: typeof fetch

    private storageDir = path.resolve(
        process.cwd(),
        "storage/shipping-labels"
    )

    constructor(
        private config: GelConfig,
        fetcher: typeof fetch = fetch
    ) {
        super()
        this.fetcher = fetcher
    }

    async createDeliveryOrder(
        params: CreateDeliveryOrderParams
    ): Promise<DeliveryResult> {
        const url = this.buildUrl(params)

        const response = await this.fetcher(url, { method: "GET" })

        if (!response.ok) {
            throw new Error(`GEL request failed ${response.status}`)
        }

        const xml = await response.text()

        const result = this.parseResponse(xml)

        await this.persistShipment(params.orderId, result)

        return result
    }

    private async persistShipment(
        orderId: string,
        result: DeliveryResult
    ) {
        await mkdir(this.storageDir, { recursive: true })

        const shipmentId = randomUUID()

        await db.transaction(async (tx) => {
            await tx.insert(shippingShipment).values({
                id: shipmentId,
                order_id: orderId,
                carrier: "gel",
                shipment_number: result.shipmentNumber,
            })

            for (let i = 0; i < result.labels.length; i++) {
                const label = result.labels[i]

                const fileName = `gel_${result.shipmentNumber}_${i + 1}.pdf`
                const filePath = path.join(this.storageDir, fileName)

                await writeFile(filePath, label.data)

                await tx.insert(shippingDocument).values({
                    id: randomUUID(),
                    shipment_id: shipmentId,
                    document_type: "label",
                    storage_key: filePath,
                })
            }
        })
    }

    private buildUrl(params: CreateDeliveryOrderParams): string {
        const p = new URLSearchParams()

        p.set("key", this.config.apiKey)
        p.set("depot", String(this.config.depot))
        p.set("knr", String(this.config.knr))
        p.set("function", "create")

        const { sender, receiver } = params

        p.set("sname1", sender.name1)
        p.set("sname2", sender.name2 ?? "")
        p.set("sstreet", sender.street)
        p.set("szipcode", sender.zipcode)
        p.set("stown", sender.town)
        p.set("scountry", sender.country)

        p.set("cname1", receiver.name1)

        if (receiver.name2) p.set("cname2", receiver.name2)

        p.set("cstreet", receiver.street)
        p.set("czipcode", receiver.zipcode)
        p.set("ctown", receiver.town)
        p.set("ccountry", receiver.country)

        p.set("srv", "STD")

        p.set("collicnt", String(params.parcels.length))

        params.parcels.forEach((parcel) => {
            p.append("colli", this.formatParcel(parcel))
        })

        return `${this.baseUrl}?${p.toString()}`
    }

    private formatParcel(parcel: CreateDeliveryOrderParams["parcels"][0]) {
        return [
            "",
            parcel.weight ?? "",
            parcel.length ?? "",
            parcel.width ?? "",
            parcel.height ?? "",
            parcel.description ?? "",
        ].join("|")
    }

    private parseResponse(xml: string): DeliveryResult {
        const snrMatch = xml.match(/<snr>(.*?)<\/snr>/)

        if (!snrMatch) {
            throw new Error("Invalid GEL response")
        }

        const labelMatches = [
            ...xml.matchAll(/<labeldata>(.*?)<\/labeldata>/g),
        ]

        const labels = labelMatches.map((m) => ({
            data: Buffer.from(m[1], "base64"),
        }))

        return {
            shipmentNumber: snrMatch[1],
            labels,
        }
    }
}
