import { GelDeliveryService } from "@/server/delivery/providers/gel/GelDeliveryService"

// const enabled = process.env.RUN_INTEGRATION_TESTS === "true"
// const describeIf = enabled ? describe : describe.skip

describe("GEL API integration", () => {
    it("creates shipment", async () => {
        const service = new GelDeliveryService({
            apiKey: process.env.GEL_API_KEY!,
            depot: Number(process.env.GEL_DEPOT),
            knr: Number(process.env.GEL_KNR)
        })

        const result = await service.createDeliveryOrder({
            sender: {
                name1: "Test Shop",
                street: "Teststraße 1",
                zipcode: "70173",
                town: "Stuttgart",
                country: "D"
            },

            receiver: {
                name1: "Integration Test",
                street: "Testweg 2",
                zipcode: "80331",
                town: "München",
                country: "D"
            },

            parcels: [
                {
                    weight: 5,
                    description: "Test parcel"
                }
            ]
        })

        expect(result.shipmentNumber).toBeDefined()
        expect(result.labels.length).toBeGreaterThan(0)
    }, 30000)
})
