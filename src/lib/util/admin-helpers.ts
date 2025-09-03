/**
 * Admin Helper Utilities
 * 
 * This file contains utility functions for handling admin operations
 * and preventing common errors like "metadata.collections is undefined"
 */

export interface ProductMetadata {
  collections?: Array<{
    id: string
    title: string
    handle: string
  }>
  [key: string]: any
}

export interface BulkEditData {
  metadata: ProductMetadata
  products: Array<{
    id: string
    title: string
    metadata?: ProductMetadata
  }>
}

/**
 * Safely gets collections from metadata, preventing undefined errors
 * This is the type of fix needed for the BulkEditModal error
 */
export const getCollectionsFromMetadata = (metadata: ProductMetadata | undefined): Array<{
  id: string
  title: string
  handle: string
}> => {
  // Defensive programming to prevent "metadata.collections is undefined" errors
  if (!metadata) {
    console.warn('Metadata is undefined, returning empty collections array')
    return []
  }

  if (!metadata.collections) {
    console.warn('metadata.collections is undefined, returning empty array')
    return []
  }

  if (!Array.isArray(metadata.collections)) {
    console.warn('metadata.collections is not an array, returning empty array')
    return []
  }

  return metadata.collections
}

/**
 * Safely handles bulk edit data to prevent metadata errors
 */
export const processBulkEditData = (data: BulkEditData | undefined): {
  collections: Array<{ id: string; title: string; handle: string }>
  products: Array<{ id: string; title: string; collections: Array<{ id: string; title: string; handle: string }> }>
} => {
  const result = {
    collections: [] as Array<{ id: string; title: string; handle: string }>,
    products: [] as Array<{ id: string; title: string; collections: Array<{ id: string; title: string; handle: string }> }>
  }

  if (!data) {
    return result
  }

  // Safely get collections from main metadata
  result.collections = getCollectionsFromMetadata(data.metadata)

  // Process products with safe collection handling
  if (data.products && Array.isArray(data.products)) {
    result.products = data.products.map(product => ({
      id: product.id,
      title: product.title,
      collections: getCollectionsFromMetadata(product.metadata)
    }))
  }

  return result
}

/**
 * Example of how the BulkEditModal should handle metadata safely
 * This would be the fix for line 166 in BulkEditModal.tsx
 */
export const safeBulkEditModalHandler = (metadata: ProductMetadata | undefined) => {
  // Instead of directly accessing metadata.collections (which causes the error)
  // Use safe access with fallbacks:
  
  // ❌ This causes the error:
  // const collections = metadata.collections
  
  // ✅ This prevents the error:
  const collections = getCollectionsFromMetadata(metadata)
  
  // Now you can safely use collections array
  return collections.map(collection => ({
    ...collection,
    selected: false // or whatever processing is needed
  }))
}

/**
 * Mock function showing how to handle the admin API response safely
 */
export const handleAdminApiResponse = (response: any) => {
  try {
    // Ensure response has expected structure
    if (!response || typeof response !== 'object') {
      throw new Error('Invalid API response')
    }

    // Safely access nested properties
    const metadata = response.metadata || {}
    const collections = getCollectionsFromMetadata(metadata)
    
    return {
      success: true,
      data: {
        ...response,
        metadata: {
          ...metadata,
          collections
        }
      }
    }
  } catch (error) {
    console.error('Error processing admin API response:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    }
  }
} 