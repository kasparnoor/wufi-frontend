export interface Location {
  id: string
  name: string
  type: 'pakiautomaat' | 'postipunkt'
  address: string
  zip: string
  city: string
  county: string
  coordinates: {
    x: number
    y: number
  }
  serviceHours: string
}

export interface RawLocation {
  ZIP: string
  NAME: string
  TYPE: string
  A0_NAME: string
  A1_NAME: string  // maakond
  A2_NAME: string  // vald
  A3_NAME: string  // linn/alev/küla
  A4_NAME: string
  A5_NAME: string  // tänav/mnt
  A6_NAME: string
  A7_NAME: string  // maja number
  A8_NAME: string
  X_COORDINATE: string
  Y_COORDINATE: string
  SERVICE_HOURS: string
  TEMP_SERVICE_HOURS: string
  TEMP_SERVICE_HOURS_UNTIL: string
  TEMP_SERVICE_HOURS_2: string
  TEMP_SERVICE_HOURS_2_UNTIL: string
  comment_est: string
  comment_eng: string
  comment_rus: string
  comment_lav: string
  comment_lit: string
  MODIFIED: string
}

/**
 * Load pakiautomaat and postipunkt locations from the JSON file
 */
export async function loadLocations(): Promise<Location[]> {
  // Create timeout controller for location loading
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
  
  try {
    console.log('Loading locations from /api/saatmine/locations_ee.json')
    
    // Use the new API route with timeout control
    const response = await fetch(`${window.location.origin}/api/saatmine/locations_ee.json`, {
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    console.log('Response status:', response.status, response.statusText)
    
    if (!response.ok) {
      throw new Error(`Failed to load locations: ${response.status} ${response.statusText}`)
    }
    
    const text = await response.text()
    console.log('Response text length:', text.length)
    
    const rawLocations: RawLocation[] = JSON.parse(text)
    console.log('Loaded', rawLocations.length, 'raw locations')
    
    // Filter for pakiautomaat (TYPE "0") and postipunkt (TYPE "1")
    const filteredLocations = rawLocations.filter(location => 
      location.TYPE === "0" || location.TYPE === "1"
    )

    
    // Transform and sort locations
    const transformedLocations = filteredLocations
      .map((raw, index) => transformLocation(raw, index))
      .filter(location => location !== null)
      .sort((a, b) => {
        // Sort by type (pakiautomaat first), then by name
        if (a.type !== b.type) {
          return a.type === 'pakiautomaat' ? -1 : 1
        }
        return a.name.localeCompare(b.name, 'et')
      })
    

    
    return transformedLocations
  } catch (error) {
    clearTimeout(timeoutId)
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.warn('Location loading timed out after 10 seconds')
      } else {
        console.error('Error loading locations:', error.message)
      }
    } else {
      console.error('Error loading locations:', error)
    }
    return []
  }
}

/**
 * Transform raw location data to our format
 */
function transformLocation(raw: RawLocation, index: number): Location | null {
  try {
    // Build address components
    const addressParts = [
      raw.A5_NAME, // street
      raw.A7_NAME, // house number
    ].filter(Boolean)
    
    const cityParts = [
      raw.A3_NAME, // linn/alev/küla
      raw.A2_NAME, // vald
    ].filter(Boolean)
    
    const address = addressParts.length > 0 
      ? addressParts.join(' ')
      : cityParts[0] || raw.A1_NAME || 'Aadress puudub'
    
    const city = cityParts[0] || raw.A1_NAME || 'Teadmata'
    const county = raw.A1_NAME || 'Teadmata maakond'
    
    const transformed: Location = {
      id: `${raw.TYPE}_${raw.ZIP}_${index}`,
      name: raw.NAME,
      type: raw.TYPE === "0" ? 'pakiautomaat' : 'postipunkt',
      address: `${address}, ${city}`,
      zip: raw.ZIP,
      city,
      county,
      coordinates: {
        x: parseFloat(raw.X_COORDINATE) || 0,
        y: parseFloat(raw.Y_COORDINATE) || 0,
      },
      serviceHours: raw.SERVICE_HOURS || '',
    }
    

    
    return transformed
  } catch (error) {
    console.warn('Failed to transform location:', raw, error)
    return null
  }
}

/**
 * Get display name with type indicator
 */
export function getLocationDisplayName(location: Location): string {
  const typeIndicator = location.type === 'pakiautomaat' ? '📦' : '📮'
  return `${typeIndicator} ${location.name}`
}

/**
 * Filter locations by search term
 */
export function filterLocations(locations: Location[], searchTerm: string): Location[] {
  if (!searchTerm.trim()) {
    return locations
  }
  
  const term = searchTerm.toLowerCase().trim()
  return locations.filter(location => 
    location.name.toLowerCase().includes(term) ||
    location.address.toLowerCase().includes(term) ||
    location.city.toLowerCase().includes(term) ||
    location.county.toLowerCase().includes(term) ||
    location.zip.includes(term)
  )
} 