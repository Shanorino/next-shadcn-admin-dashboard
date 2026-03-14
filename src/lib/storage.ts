import path from "path";

/**
 * Storage utility to resolve storage keys to URLs and file paths.
 * This abstraction allows easy migration from local storage to cloud storage (S3, Azure, etc.)
 *
 * CURRENT IMPLEMENTATION: Local file storage
 * - storage_key in DB contains full absolute file paths (e.g., C:\...\storage\shipping-labels\file.pdf)
 * - Files are served through Next.js API route
 *
 * FUTURE MIGRATION PATH:
 * - Change storage_key to store only the key/filename (e.g., "gel_TEST123456_1.pdf")
 * - Update resolveStorageKeyToUrl to generate S3/Azure signed URLs
 * - Remove the API route as cloud storage provides direct URLs
 */

export interface StorageConfig {
  type: "local" | "s3" | "azure";
  // Add more config properties as needed for different storage types
  // s3Config?: { bucket: string; region: string };
  // azureConfig?: { account: string; container: string };
}

/**
 * Extracts the filename from a storage key.
 * For local storage, the key is a full file path - extract the basename.
 * For cloud storage, it might already be just a key/filename.
 *
 * @param storageKey - The storage key from the database
 * @returns The filename to use in URLs
 */
export function extractFilenameFromStorageKey(storageKey: string): string {
  // Extract just the filename from the path
  // This handles both Windows (backslash) and Unix (forward slash) paths
  const filename = path.basename(storageKey);
  return filename;
}

/**
 * Resolves a storage key to a downloadable URL.
 * This function can be extended to support different storage backends.
 *
 * @param storageKey - The storage key from the database
 * @param config - Optional storage configuration (defaults to local)
 * @returns The URL to download the file
 */
export function resolveStorageKeyToUrl(
  storageKey: string,
  config: StorageConfig = { type: "local" }
): string {
  switch (config.type) {
    case "local":
      // For local storage, extract filename and use API route
      const filename = extractFilenameFromStorageKey(storageKey);
      return `/api/delivery/labels/${filename}`;

    case "s3":
      // TODO: Implement S3 URL generation
      // const s3Key = extractFilenameFromStorageKey(storageKey);
      // return generateS3SignedUrl(s3Key, config.s3Config);
      throw new Error("S3 storage not yet implemented");

    case "azure":
      // TODO: Implement Azure Blob Storage URL generation
      // const blobName = extractFilenameFromStorageKey(storageKey);
      // return generateAzureBlobSasUrl(blobName, config.azureConfig);
      throw new Error("Azure storage not yet implemented");

    default:
      throw new Error(`Unsupported storage type: ${config.type}`);
  }
}

/**
 * Resolves a storage key to a file system path.
 * Only applicable for local storage.
 *
 * @param storageKey - The storage key from the database
 * @returns The absolute file system path
 */
export function resolveStorageKeyToFilePath(storageKey: string): string {
  // For current implementation, storage_key contains the full absolute path
  // Return as-is if it's already absolute
  if (path.isAbsolute(storageKey)) {
    return storageKey;
  }

  // If it's a relative path or just a filename, resolve it to the storage directory
  // This would be the path when migrating to cloud storage (storing just the key)
  return path.join(process.cwd(), "storage", "shipping-labels", storageKey);
}



