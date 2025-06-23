import { query } from './db'
import { DistributorApplicationFormData } from './distributor-validation'

export interface DistributionRequest {
  id: string
  uniqueId: string
  fullName: string
  businessName: string
  phoneNumber: string
  emailAddress: string
  street: string
  city: string
  state: string
  zipCode: string
  website?: string
  businessType: string
  businessTypeOther?: string
  yearsInBusiness: string
  territory: string
  purchaseVolume: string
  sellsSimilarProducts: string
  similarProductsDetails?: string
  hearAboutUs: string
  hearAboutUsOther?: string
  status: 'pending' | 'accepted' | 'declined'
  latitude?: number
  longitude?: number
  createdAt: Date
  updatedAt: Date
  respondedAt?: Date
}

export interface Distributor {
  id: string
  distributionRequestId: string
  businessName: string
  contactName: string
  phoneNumber: string
  emailAddress: string
  street: string
  city: string
  state: string
  zipCode: string
  website?: string
  businessType: string
  territory: string
  latitude: number
  longitude: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Initialize distribution tables
export async function initializeDistributionTables() {
  try {
    // Create distribution_requests table
    await query(`
      CREATE TABLE IF NOT EXISTS distribution_requests (
        id SERIAL PRIMARY KEY,
        unique_id UUID UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        business_name VARCHAR(255) NOT NULL,
        phone_number VARCHAR(50) NOT NULL,
        email_address VARCHAR(255) NOT NULL,
        street VARCHAR(500) NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(50) NOT NULL,
        zip_code VARCHAR(20) NOT NULL,
        website VARCHAR(500),
        business_type VARCHAR(100) NOT NULL,
        business_type_other VARCHAR(255),
        years_in_business VARCHAR(50) NOT NULL,
        territory TEXT NOT NULL,
        purchase_volume VARCHAR(100) NOT NULL,
        sells_similar_products VARCHAR(10) NOT NULL,
        similar_products_details TEXT,
        hear_about_us VARCHAR(100) NOT NULL,
        hear_about_us_other VARCHAR(255),
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        responded_at TIMESTAMP WITH TIME ZONE
      )
    `)

    // Create distributors table (for accepted distributors)
    await query(`
      CREATE TABLE IF NOT EXISTS distributors (
        id SERIAL PRIMARY KEY,
        distribution_request_id INTEGER REFERENCES distribution_requests(id),
        business_name VARCHAR(255) NOT NULL,
        contact_name VARCHAR(255) NOT NULL,
        phone_number VARCHAR(50) NOT NULL,
        email_address VARCHAR(255) NOT NULL,
        street VARCHAR(500) NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(50) NOT NULL,
        zip_code VARCHAR(20) NOT NULL,
        website VARCHAR(500),
        business_type VARCHAR(100) NOT NULL,
        territory TEXT NOT NULL,
        latitude DECIMAL(10,8) NOT NULL,
        longitude DECIMAL(11,8) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create indexes for performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_distribution_requests_unique_id ON distribution_requests(unique_id)
    `)
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_distribution_requests_status ON distribution_requests(status)
    `)
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_distribution_requests_email ON distribution_requests(email_address)
    `)
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_distributors_location ON distributors(latitude, longitude)
    `)
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_distributors_active ON distributors(is_active)
    `)
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_distributors_state ON distributors(state)
    `)
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_distributors_zip ON distributors(zip_code)
    `)

    console.log('Distribution tables initialized successfully')
  } catch (error) {
    console.error('Error initializing distribution tables:', error)
    throw error
  }
}

// Create a new distribution request
export async function createDistributionRequest(
  formData: DistributorApplicationFormData,
  uniqueId: string
): Promise<DistributionRequest> {
  try {
    const result = await query(`
      INSERT INTO distribution_requests (
        unique_id, full_name, business_name, phone_number, email_address,
        street, city, state, zip_code, website, business_type, business_type_other,
        years_in_business, territory, purchase_volume, sells_similar_products,
        similar_products_details, hear_about_us, hear_about_us_other
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *
    `, [
      uniqueId,
      formData.fullName,
      formData.businessName,
      formData.phoneNumber,
      formData.emailAddress,
      formData.street,
      formData.city,
      formData.state,
      formData.zipCode,
      formData.website || null,
      formData.businessType,
      formData.businessTypeOther || null,
      formData.yearsInBusiness,
      formData.territory,
      formData.purchaseVolume,
      formData.sellsSimilarProducts,
      formData.similarProductsDetails || null,
      formData.hearAboutUs,
      formData.hearAboutUsOther || null
    ])

    const row = result.rows[0]
    return mapRowToDistributionRequest(row)
  } catch (error) {
    console.error('Error creating distribution request:', error)
    throw error
  }
}

// Get distribution request by unique ID
export async function getDistributionRequestByUniqueId(uniqueId: string): Promise<DistributionRequest | null> {
  try {
    const result = await query('SELECT * FROM distribution_requests WHERE unique_id = $1', [uniqueId])
    
    if (result.rows.length === 0) {
      return null
    }

    return mapRowToDistributionRequest(result.rows[0])
  } catch (error) {
    console.error('Error getting distribution request by unique ID:', error)
    throw error
  }
}

// Update distribution request status
export async function updateDistributionRequestStatus(
  uniqueId: string,
  status: 'accepted' | 'declined'
): Promise<DistributionRequest | null> {
  try {
    const result = await query(`
      UPDATE distribution_requests 
      SET status = $1, responded_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE unique_id = $2
      RETURNING *
    `, [status, uniqueId])

    if (result.rows.length === 0) {
      return null
    }

    return mapRowToDistributionRequest(result.rows[0])
  } catch (error) {
    console.error('Error updating distribution request status:', error)
    throw error
  }
}

// Create distributor from accepted request
export async function createDistributorFromRequest(request: DistributionRequest): Promise<Distributor> {
  try {
    // First, get or geocode the coordinates if not available
    let latitude = request.latitude
    let longitude = request.longitude

    if (!latitude || !longitude) {
      const coords = await geocodeAddress(`${request.street}, ${request.city}, ${request.state} ${request.zipCode}`)
      latitude = coords.latitude
      longitude = coords.longitude

      // Update the request with coordinates
      await query(`
        UPDATE distribution_requests
        SET latitude = $1, longitude = $2, updated_at = CURRENT_TIMESTAMP
        WHERE unique_id = $3
      `, [latitude, longitude, request.uniqueId])
    }

    const result = await query(`
      INSERT INTO distributors (
        distribution_request_id, business_name, contact_name, phone_number, email_address,
        street, city, state, zip_code, website, business_type, territory,
        latitude, longitude
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      request.id,
      request.businessName,
      request.fullName,
      request.phoneNumber,
      request.emailAddress,
      request.street,
      request.city,
      request.state,
      request.zipCode,
      request.website || null,
      request.businessType,
      request.territory,
      latitude,
      longitude
    ])

    const row = result.rows[0]
    return mapRowToDistributor(row)
  } catch (error) {
    console.error('Error creating distributor from request:', error)
    throw error
  }
}

// Get all active distributors
export async function getActiveDistributors(): Promise<Distributor[]> {
  try {
    const result = await query(
      'SELECT * FROM distributors WHERE is_active = true ORDER BY business_name',
      []
    )

    return result.rows.map(mapRowToDistributor)
  } catch (error) {
    console.error('Error getting active distributors:', error)
    throw error
  }
}

// Find distributors near a location
export async function findDistributorsNearLocation(
  latitude: number,
  longitude: number,
  radiusMiles: number = 50
): Promise<(Distributor & { distance: number })[]> {
  try {
    // Using the Haversine formula to calculate distance
    const result = await query(`
      SELECT *,
        (3959 * acos(
          cos(radians($1)) * cos(radians(latitude)) *
          cos(radians(longitude) - radians($2)) +
          sin(radians($1)) * sin(radians(latitude))
        )) AS distance
      FROM distributors
      WHERE is_active = true
      HAVING distance <= $3
      ORDER BY distance
    `, [latitude, longitude, radiusMiles])

    return result.rows.map(row => ({
      ...mapRowToDistributor(row),
      distance: parseFloat(row.distance)
    }))
  } catch (error) {
    console.error('Error finding distributors near location:', error)
    throw error
  }
}

// Import geocoding functionality
import { geocodeAddress as geocodeAddressService } from './geolocation'

// Geocode address to get coordinates
async function geocodeAddress(address: string): Promise<{ latitude: number; longitude: number }> {
  try {
    const result = await geocodeAddressService(address)
    return {
      latitude: result.latitude,
      longitude: result.longitude
    }
  } catch (error) {
    console.error('Error geocoding address:', error)
    // Default to Force Dowel Company location as fallback
    return {
      latitude: 33.3528,
      longitude: -111.7890
    }
  }
}

// Helper function to map database row to DistributionRequest
function mapRowToDistributionRequest(row: any): DistributionRequest {
  return {
    id: row.id.toString(),
    uniqueId: row.unique_id,
    fullName: row.full_name,
    businessName: row.business_name,
    phoneNumber: row.phone_number,
    emailAddress: row.email_address,
    street: row.street,
    city: row.city,
    state: row.state,
    zipCode: row.zip_code,
    website: row.website,
    businessType: row.business_type,
    businessTypeOther: row.business_type_other,
    yearsInBusiness: row.years_in_business,
    territory: row.territory,
    purchaseVolume: row.purchase_volume,
    sellsSimilarProducts: row.sells_similar_products,
    similarProductsDetails: row.similar_products_details,
    hearAboutUs: row.hear_about_us,
    hearAboutUsOther: row.hear_about_us_other,
    status: row.status,
    latitude: row.latitude ? parseFloat(row.latitude) : undefined,
    longitude: row.longitude ? parseFloat(row.longitude) : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    respondedAt: row.responded_at
  }
}

// Helper function to map database row to Distributor
function mapRowToDistributor(row: any): Distributor {
  return {
    id: row.id.toString(),
    distributionRequestId: row.distribution_request_id.toString(),
    businessName: row.business_name,
    contactName: row.contact_name,
    phoneNumber: row.phone_number,
    emailAddress: row.email_address,
    street: row.street,
    city: row.city,
    state: row.state,
    zipCode: row.zip_code,
    website: row.website,
    businessType: row.business_type,
    territory: row.territory,
    latitude: parseFloat(row.latitude),
    longitude: parseFloat(row.longitude),
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}
