import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import {WebShopFactory} from "@/server/webshop/web-shop-factory";

describe("Amazon SP API integration", () => {
    it("fetches and converts orders", async () => {
        const amazonWebShopService= WebShopFactory.create("amazon")

        const orders = await amazonWebShopService.fetchOrders()

        expect(orders.length).toBe(1)

        const order = orders[0]

        expect(order.externalOrderId).toBe("AMZ-TEST-001")
        expect(order.customerName).toBe("Alice Thompson")
        expect(order.totalAmount).toBe(129.99)
        expect(order.provider).toBe("amazon")
    })
})
