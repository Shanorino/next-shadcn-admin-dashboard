import { WebShopService } from "./WebShopService"
import { AmazonWebShopService } from "./providers/amazon/AmazonWebShopService"

export type WebShopProvider = "amazon" | "ebay" | "shopify"

export class WebShopFactory {

    static create(provider: WebShopProvider): WebShopService {

        switch (provider) {

            case "amazon":
                if (!process.env.AMAZON_SELLER_API_KEY) {
                    throw new Error("Amazon Seller API key not configured");
                }

                return new AmazonWebShopService(
                    process.env.AMAZON_SELLER_API_KEY!
                )

            default:
                throw new Error(`Unsupported webshop provider: ${provider}`)
        }
    }
}
