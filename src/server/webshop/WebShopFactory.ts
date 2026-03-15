import { WebShopService } from "./WebShopService"
import { AmazonWebShopService } from "./providers/amazon/AmazonWebShopService"

export type WebShopProvider = "amazon" | "ebay" | "shopify"

export class WebShopFactory {

    static create(provider: WebShopProvider): WebShopService {

        switch (provider) {

            case "amazon":
                if (!process.env.AMAZON_SP_REFRESH_TOKEN) {
                    throw new Error("Amazon Seller API key not configured");
                }

                return new AmazonWebShopService({
                    region: "eu",
                    refreshToken: process.env.AMAZON_SP_REFRESH_TOKEN!,
                    sandbox: process.env.AMAZON_SELLER_API_SANDBOX === "true"
                })

            default:
                throw new Error(`Unsupported webshop provider: ${provider}`)
        }
    }
}
