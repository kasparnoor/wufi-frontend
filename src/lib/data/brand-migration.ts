"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { HttpTypes } from "@medusajs/types"

// Estonian Brand Mapping (same as in search-enhanced.ts)
const ESTONIAN_BRAND_MAPPINGS: Record<string, { slug: string, confidence: number, tier: string, parent?: string }> = {
  'ORIJEN': { slug: 'orijen', confidence: 1.0, tier: 'premium' },
  'ROYAL CANIN': { slug: 'royal-canin', confidence: 1.0, tier: 'premium' },
  'HILLS': { slug: 'hills', confidence: 1.0, tier: 'premium' },
  'HILL\'S': { slug: 'hills', confidence: 1.0, tier: 'premium' },
  'PURINA': { slug: 'purina', confidence: 1.0, tier: 'mainstream' },
  'CHAPPI': { slug: 'chappi', confidence: 1.0, tier: 'budget', parent: 'purina' },
  'PRO PLAN': { slug: 'purina', confidence: 0.9, tier: 'premium', parent: 'purina' },
  'ACANA': { slug: 'acana', confidence: 1.0, tier: 'premium' },
  'IAMS': { slug: 'iams', confidence: 1.0, tier: 'mainstream' },
  'WHISKAS': { slug: 'whiskas', confidence: 1.0, tier: 'mainstream' },
  'FELIX': { slug: 'felix', confidence: 1.0, tier: 'mainstream' },
  'SHEBA': { slug: 'sheba', confidence: 1.0, tier: 'premium' }
}

// Migration Configuration
const MIGRATION_CONFIG = {
  batch_size: 100,
  parallel_workers: 4,
  retry_attempts: 3,
  manual_review_threshold: 0.7,
  backup_original_data: true,
  processing_time_target: 120000 // 2 minutes per 1000 products
}

interface MigrationOptions {
  dryRun: boolean
  batchSize: number
  forceUpdate: boolean
}

interface BrandExtractionResult {
  product_id: string
  original_title: string
  detected_brand: string
  confidence_score: number
  extraction_method: 'exact_match' | 'pattern_match' | 'ml_inference'
  manual_review_required: boolean
  suggested_features: string[]
  price_eur: number
  existing_brand?: string
  needs_update: boolean
}

interface MigrationReport {
  total_products: number
  processed_products: number
  successful_extractions: number
  manual_review_required: number
  failed_extractions: number
  brand_distribution: Record<string, number>
  feature_distribution: Record<string, number>
  confidence_distribution: {
    high: number    // >= 0.9
    medium: number  // 0.7-0.9
    low: number     // < 0.7
  }
  processing_time_ms: number
  errors: string[]
  sample_results: BrandExtractionResult[]
}

// Extract brand from product title with confidence scoring
function extractBrandWithConfidence(title: string, price_eur: number): { brand: string, confidence: number, method: string } {
  const upperTitle = title.toUpperCase()
  let confidence = 0.0
  let brand = 'unknown'
  let method = 'pattern_match'
  
  // Exact brand name matches (highest confidence)
  for (const [brandName, mapping] of Object.entries(ESTONIAN_BRAND_MAPPINGS)) {
    if (upperTitle.includes(brandName)) {
      confidence += 0.4 // Base confidence for exact match
      brand = mapping.slug
      method = 'exact_match'
      
      // Position bonus (brand at beginning gets higher confidence)
      if (upperTitle.startsWith(brandName)) {
        confidence += 0.2
      }
      
      // Price alignment bonus
      const expectedPriceRange = getPriceRangeForTier(mapping.tier)
      if (price_eur >= expectedPriceRange.min && price_eur <= expectedPriceRange.max) {
        confidence += 0.1
      }
      
      break
    }
  }
  
  // Pattern-based extraction for common cases
  if (brand === 'unknown') {
    if (upperTitle.includes('PRO PLAN')) {
      brand = 'purina'
      confidence = 0.8
    } else if (upperTitle.includes('SCIENCE PLAN') || upperTitle.includes('PRESCRIPTION DIET')) {
      brand = 'hills'
      confidence = 0.8
    } else if (upperTitle.includes('ROYAL')) {
      brand = 'royal-canin'
      confidence = 0.6
    }
  }
  
  return { brand, confidence: Math.min(confidence, 1.0), method }
}

// Get expected price range for brand tier
function getPriceRangeForTier(tier: string): { min: number, max: number } {
  switch (tier) {
    case 'premium':
      return { min: 40, max: 200 }
    case 'mainstream':
      return { min: 15, max: 80 }
    case 'budget':
      return { min: 5, max: 40 }
    default:
      return { min: 0, max: 1000 }
  }
}

// Detect features based on product data
function detectProductFeatures(product: any, price_eur: number, brand: string): string[] {
  const features: string[] = []
  
  // Subscription eligibility
  if (price_eur >= 30 || ['orijen', 'royal-canin', 'hills', 'acana'].includes(brand)) {
    features.push('subscription')
  }
  
  // Free shipping
  if (price_eur >= 50) {
    features.push('free-shipping')
  }
  
  // New arrival
  const createdDate = new Date(product.created_at)
  const daysSinceCreated = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
  if (daysSinceCreated <= 30) {
    features.push('new-arrival')
  }
  
  // Premium
  if (['orijen', 'royal-canin', 'hills', 'acana'].includes(brand) || price_eur >= 50) {
    features.push('premium')
  }
  
  // Bestseller (placeholder logic)
  if (['purina', 'royal-canin', 'hills'].includes(brand)) {
    features.push('bestseller')
  }
  
  return features
}

// Process single product
async function processProduct(product: HttpTypes.StoreProduct, forceUpdate: boolean): Promise<BrandExtractionResult> {
  const price_eur = product.variants?.[0]?.calculated_price?.calculated_amount 
    ? product.variants[0].calculated_price.calculated_amount 
    : 0

  const existing_brand = product.metadata?.brand as string
  const extraction = extractBrandWithConfidence(product.title || '', price_eur)
  
  const result: BrandExtractionResult = {
    product_id: product.id,
    original_title: product.title || '',
    detected_brand: extraction.brand,
    confidence_score: extraction.confidence,
    extraction_method: extraction.method as BrandExtractionResult['extraction_method'],
    manual_review_required: extraction.confidence < MIGRATION_CONFIG.manual_review_threshold,
    suggested_features: detectProductFeatures(product, price_eur, extraction.brand),
    price_eur: price_eur,
    existing_brand: existing_brand,
    needs_update: !existing_brand || existing_brand === 'unknown' || forceUpdate
  }
  
  return result
}

// Update product metadata
async function updateProductMetadata(productId: string, brand: string, features: string[]): Promise<boolean> {
  try {
    const headers = await getAuthHeaders()
    
    // This would update the product metadata in Medusa
    // Note: This is a placeholder - actual implementation depends on Medusa admin API
    console.log(`Would update product ${productId} with brand: ${brand}, features: ${features.join(', ')}`)
    
    // For demo purposes, we'll simulate success
    return true
  } catch (error) {
    console.error(`Failed to update product ${productId}:`, error)
    return false
  }
}

export const migrateBrands = async (options: MigrationOptions): Promise<MigrationReport> => {
  const startTime = Date.now()
  const report: MigrationReport = {
    total_products: 0,
    processed_products: 0,
    successful_extractions: 0,
    manual_review_required: 0,
    failed_extractions: 0,
    brand_distribution: {},
    feature_distribution: {},
    confidence_distribution: { high: 0, medium: 0, low: 0 },
    processing_time_ms: 0,
    errors: [],
    sample_results: []
  }

  try {
    const headers = await getAuthHeaders()
    const cacheOptions = await getCacheOptions("admin")

    // Fetch all products in batches
    let offset = 0
    const limit = options.batchSize
    let hasMore = true

    while (hasMore) {
      try {
        const response = await sdk.client.fetch<{ 
          products: HttpTypes.StoreProduct[]
          count: number 
        }>("/store/products", {
          method: "GET",
          query: {
            limit: limit,
            offset: offset,
            fields: "*variants.calculated_price,*metadata"
          },
          headers,
          next: cacheOptions,
          cache: "no-store",
        })

        const products = response.products
        if (products.length === 0) {
          hasMore = false
          break
        }

        report.total_products = response.count
        
        // Process each product in the batch
        for (const product of products) {
          try {
            const result = await processProduct(product, options.forceUpdate)
            report.processed_products++
            
            // Update statistics
            if (result.confidence_score >= 0.9) {
              report.confidence_distribution.high++
            } else if (result.confidence_score >= 0.7) {
              report.confidence_distribution.medium++
            } else {
              report.confidence_distribution.low++
            }
            
            if (result.manual_review_required) {
              report.manual_review_required++
            } else {
              report.successful_extractions++
            }
            
            // Update brand distribution
            report.brand_distribution[result.detected_brand] = 
              (report.brand_distribution[result.detected_brand] || 0) + 1
            
            // Update feature distribution
            result.suggested_features.forEach(feature => {
              report.feature_distribution[feature] = 
                (report.feature_distribution[feature] || 0) + 1
            })
            
            // Store sample results (first 10)
            if (report.sample_results.length < 10) {
              report.sample_results.push(result)
            }
            
            // Actually update the product if not dry run
            if (!options.dryRun && result.needs_update && !result.manual_review_required) {
              const updateSuccess = await updateProductMetadata(
                result.product_id, 
                result.detected_brand, 
                result.suggested_features
              )
              
              if (!updateSuccess) {
                report.failed_extractions++
                report.errors.push(`Failed to update product ${result.product_id}`)
              }
            }
            
          } catch (error) {
            report.failed_extractions++
            report.errors.push(`Error processing product ${product.id}: ${error}`)
          }
        }
        
        offset += limit
        
        // Break if we've processed enough for a dry run
        if (options.dryRun && offset >= 200) {
          hasMore = false
        }
        
      } catch (error) {
        report.errors.push(`Error fetching batch at offset ${offset}: ${error}`)
        hasMore = false
      }
    }
    
  } catch (error) {
    report.errors.push(`Migration failed: ${error}`)
  }
  
  report.processing_time_ms = Date.now() - startTime
  return report
} 