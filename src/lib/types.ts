export type UserRole = 'farmer' | 'buyer'

export type CropCategory =
  | 'food_grains'
  | 'pulses'
  | 'vegetables'
  | 'fruits'
  | 'oilseeds'
  | 'spices'
  | 'cash_crops'
  | 'plantation'
  | 'flowers'
  | 'medicinal'
  | 'fodder'
  | 'aquaculture'

export interface User {
  id: string
  phone: string
  active_role: UserRole
  created_at: string
}

export interface FarmerProfile {
  id: string
  user_id: string
  name: string
  village: string
  mandal: string
  district: string
  state: string
  pincode: string
  rating_avg: number
  rating_count: number
  created_at: string
}

export interface BuyerProfile {
  id: string
  user_id: string
  name: string
  village: string
  mandal: string
  district: string
  state: string
  pincode: string
  preferred_crops: string[]
  created_at: string
}

export interface CropListing {
  id: string
  farmer_id: string
  crop_category: CropCategory
  crop_name: string
  crop_variety?: string
  quantity: number
  unit: 'kg' | 'quintal' | 'tonne'
  expected_price?: number
  price_unit?: string
  is_organic: boolean
  images: string[]
  latitude: number
  longitude: number
  harvest_date?: string
  status: 'active' | 'hidden' | 'expired'
  created_at: string
  expires_at: string
  farmer?: FarmerProfile
  // for map display
  geo_point?: { lat: number; lng: number }
}

export interface Rating {
  id: string
  listing_id: string
  buyer_id: string
  farmer_id: string
  stars: number
  comment?: string
  created_at: string
}

export interface CropTaxonomy {
  id: string
  category: CropCategory
  category_label: string
  name: string
  hindi_name?: string
  popular: boolean
}

export interface MapPin {
  id: string
  latitude: number
  longitude: number
  crop_name: string
  crop_category: CropCategory
  is_organic: boolean
  images: string[]
  district: string
  state: string
  quantity: number
  unit: string
  expected_price?: number // price per unit set by farmer
  farmer_name?: string // only for logged-in buyers
  farmer_phone?: string // only for logged-in buyers
  farmer_village?: string // only for logged-in buyers
  rating_avg: number
  status: 'active' | 'hidden'
}
