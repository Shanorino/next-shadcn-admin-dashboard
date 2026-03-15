import {Parcel} from "@/server/delivery/types";

export interface SkuParcelInfo {
    weight: number
    length: number
    width: number
    height: number
    parcelCount: number
}

export const SKU_PARCEL_MAP: Record<string, SkuParcelInfo> = {
    "SKT-SP-450Wx1_FBM": { weight: 23, length: 176, width: 113, height: 4, parcelCount: 1 },
    "SKT-SP-500Wx1": { weight: 25, length: 195, width: 113, height: 4, parcelCount: 1 },
    "SKT-SP-500w+X1": { weight: 25, length: 195, width: 113, height: 4, parcelCount: 1 },

    "Skt-SP-500W+X2": { weight: 25, length: 195, width: 113, height: 4, parcelCount: 2 },
    "Skt-SP-500W+X4": { weight: 25, length: 195, width: 113, height: 4, parcelCount: 4 },
    "Skt-SP-500W+X6": { weight: 25, length: 195, width: 113, height: 4, parcelCount: 6 },
    "Skt-SP-500W+X8": { weight: 25, length: 195, width: 113, height: 4, parcelCount: 8 },

    "Skt-SP-500Wx2": { weight: 25, length: 195, width: 113, height: 4, parcelCount: 2 },
    "Skt-SP-500Wx4": { weight: 25, length: 195, width: 113, height: 4, parcelCount: 4 },
    "Skt-SP-500Wx6": { weight: 25, length: 195, width: 113, height: 4, parcelCount: 6 },
    "Skt-SP-500Wx8": { weight: 25, length: 195, width: 113, height: 4, parcelCount: 8 },

    "Skt-SP450Wx2": { weight: 23, length: 176, width: 113, height: 4, parcelCount: 2 },
    "Skt-SP450Wx4": { weight: 23, length: 176, width: 113, height: 4, parcelCount: 4 },
    "Skt-SP450Wx6": { weight: 23, length: 176, width: 113, height: 4, parcelCount: 6 },
    "Skt-SP450Wx8": { weight: 23, length: 176, width: 113, height: 4, parcelCount: 8 }
}

export function getParcelInfo(sku: string): Parcel[] {
    const info = SKU_PARCEL_MAP[sku.toUpperCase()]

    if (!info) {
        throw new Error(`Unknown SKU: ${sku}`)
    }

    return Array.from({ length: info.parcelCount }).map(() => ({
        weight: info.weight,
        length: info.length,
        width: info.width,
        height: info.height,
        description: sku
    }))
}
