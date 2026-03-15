import { GelDeliveryService } from "@/server/delivery/providers/gel/gel-delivery-service"
import { db } from "@/db";
import { readFile } from "node:fs/promises"

const mockPdfBase64 =
    "JVBERi0xLjQKMSAwIG9iago8PC9UeXBlIC9DYXRhbG9nPj4KZW5kb2JqCnhyZWYKMCAyCjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxMCAwMDAwMCBuIAp0cmFpbGVyCjw8L1NpemUgMj4+CnN0YXJ0eHJlZgozOQolJUVPRg=="

const mockXml = `
<response>
  <snr>GEL_TRACKING_NUMBER_0001</snr>
  <labeldata>${mockPdfBase64}</labeldata>
</response>
`

const mockFetch = async () =>
    ({
        ok: true,
        text: async () => mockXml,
    }) as any


describe("GEL API integration", () => {
    it("stores shipment, document, and pdf file", async () => {
        const service = new GelDeliveryService(
            {
                apiKey: "test",
                depot: 1,
                knr: 2,
            },
            mockFetch
        )

        const result = await service.createDeliveryOrder({
            orderId: "8",
            sender: {
                name1: "Test Shop",
                street: "Street 1",
                zipcode: "70173",
                town: "Stuttgart",
                country: "D",
            },
            receiver: {
                name1: "Customer",
                street: "Street 2",
                zipcode: "80331",
                town: "Munich",
                country: "D",
            },
            parcels: [{ weight: 5, description: "Box 1" }, {weight: 25, description: "Box 2"}, {length: 10, width: 20, height: 30, description: "Box 3"}],
        })

        expect(result.shipmentNumber).toBe("TEST123456")

        const shipment = await db.query.shippingShipment.findFirst({
            where: (s, { eq }) => eq(s.shipmentNumber, "GEL_TRACKING_NUMBER_0001"),
        })

        expect(shipment).not.toBeNull()

        const document = await db.query.shippingDocument.findFirst({
            where: (d, { eq }) => eq(d.shipmentId, shipment!.id),
        })

        expect(document).not.toBeNull()

        const filePath = document!.storageKey

        const file = await readFile(filePath)

        expect(file.length).toBeGreaterThan(0)
    })
})
