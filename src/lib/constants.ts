import { CropCategory } from './types'

// ─── MAP ─────────────────────────────────────────────────────────────────────
// Inline raster style — no external style.json, no fonts/glyphs needed.
// Carto dark raster tiles: completely free, no API key, bulletproof.
import type { StyleSpecification } from 'maplibre-gl'

export const MAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'carto-dark': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
      ],
      tileSize: 256,
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions" target="_blank">CARTO</a>',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'carto-dark-tiles',
      type: 'raster',
      source: 'carto-dark',
      minzoom: 0,
      maxzoom: 22,
    },
  ],
}

export const INDIA_CENTER: [number, number] = [78.9629, 20.5937]
export const INDIA_DEFAULT_ZOOM = 5
export const INDIA_BOUNDS: [[number, number], [number, number]] = [
  [68.1766451354, 7.96553477623],
  [97.4025614766, 35.4940095078],
]

// ─── CATEGORY CONFIG ──────────────────────────────────────────────────────────
export const CATEGORY_CONFIG: Record<
  CropCategory,
  { label: string; color: string; emoji: string; mapColor: string }
> = {
  food_grains:  { label: 'Food Grains',        color: 'bg-amber-500',   emoji: '🌾', mapColor: '#F59E0B' },
  pulses:       { label: 'Pulses & Dals',       color: 'bg-orange-600',  emoji: '🫘', mapColor: '#EA580C' },
  vegetables:   { label: 'Vegetables',          color: 'bg-emerald-500', emoji: '🥬', mapColor: '#10B981' },
  fruits:       { label: 'Fruits',              color: 'bg-rose-500',    emoji: '🍎', mapColor: '#F43F5E' },
  oilseeds:     { label: 'Oilseeds',            color: 'bg-yellow-500',  emoji: '🌻', mapColor: '#EAB308' },
  spices:       { label: 'Spices',              color: 'bg-red-600',     emoji: '🌶️', mapColor: '#DC2626' },
  cash_crops:   { label: 'Cash Crops',          color: 'bg-cyan-500',    emoji: '💰', mapColor: '#06B6D4' },
  plantation:   { label: 'Plantation',          color: 'bg-green-700',   emoji: '🌴', mapColor: '#15803D' },
  flowers:      { label: 'Flowers',             color: 'bg-pink-500',    emoji: '🌸', mapColor: '#EC4899' },
  medicinal:    { label: 'Medicinal & Aromatic',color: 'bg-violet-500',  emoji: '🌿', mapColor: '#8B5CF6' },
  fodder:       { label: 'Fodder & Agro',       color: 'bg-lime-500',    emoji: '🌱', mapColor: '#84CC16' },
  aquaculture:  { label: 'Aquaculture',         color: 'bg-blue-500',    emoji: '🐟', mapColor: '#3B82F6' },
}

// ─── CROP TAXONOMY ────────────────────────────────────────────────────────────
export const CROP_TAXONOMY: Record<CropCategory, string[]> = {
  food_grains: [
    'Rice - Basmati', 'Rice - Sona Masoori', 'Rice - Ponni', 'Rice - IR64',
    'Wheat - Sharbati', 'Wheat - Lokwan', 'Wheat - HD-2967',
    'Maize / Corn', 'Jowar (Sorghum)', 'Bajra (Pearl Millet)',
    'Ragi (Finger Millet)', 'Foxtail Millet', 'Kodo Millet', 'Little Millet',
    'Barley', 'Oats',
  ],
  pulses: [
    'Tur / Arhar (Pigeon Pea)', 'Chana - Desi (Chickpea)', 'Chana - Kabuli',
    'Moong (Green Gram)', 'Urad (Black Gram)', 'Masoor (Red Lentil)',
    'Rajma (Kidney Bean)', 'Moth Bean', 'Cowpea', 'Horse Gram',
    'Lobia', 'Field Pea',
  ],
  vegetables: [
    'Tomato', 'Brinjal (Eggplant)', 'Capsicum', 'Green Chilli',
    'Spinach', 'Fenugreek (Methi)', 'Coriander (Dhaniya)', 'Curry Leaf',
    'Potato', 'Onion', 'Garlic', 'Carrot', 'Radish', 'Beetroot', 'Sweet Potato',
    'Bottle Gourd', 'Bitter Gourd', 'Ridge Gourd', 'Snake Gourd', 'Pumpkin',
    'Cauliflower', 'Cabbage', 'Broccoli',
    'Okra (Bhindi)', 'Green Peas', 'Drumstick (Moringa)', 'Beans', 'Tinda',
  ],
  fruits: [
    'Mango - Alphonso', 'Mango - Banganapalli', 'Mango - Langra', 'Mango - Totapuri',
    'Banana', 'Papaya', 'Jackfruit', 'Pineapple', 'Coconut',
    'Orange (Nagpur)', 'Lemon', 'Mosambi (Sweet Lime)', 'Grapefruit',
    'Grapes - Green', 'Grapes - Black', 'Strawberry', 'Jamun', 'Ber',
    'Pomegranate', 'Guava', 'Sapota (Chikoo)', 'Watermelon', 'Muskmelon',
    'Cashew', 'Amla (Gooseberry)',
  ],
  oilseeds: [
    'Groundnut', 'Mustard / Rapeseed', 'Soybean',
    'Sunflower', 'Sesame (Til)', 'Linseed', 'Castor', 'Safflower',
  ],
  spices: [
    'Cumin (Jeera)', 'Coriander Seed', 'Fennel (Saunf)', 'Fenugreek Seed',
    'Ajwain (Carom)', 'Turmeric', 'Ginger', 'Dry Red Chilli', 'Black Pepper',
    'Cardamom', 'Cloves', 'Cinnamon', 'Saffron', 'Star Anise', 'Nutmeg',
  ],
  cash_crops: [
    'Sugarcane', 'Cotton - Long Staple', 'Cotton - Short Staple',
    'Jute', 'Tobacco',
  ],
  plantation: [
    'Tea - Assam', 'Tea - Darjeeling', 'Coffee - Arabica', 'Coffee - Robusta',
    'Rubber', 'Coconut', 'Areca Nut', 'Cocoa',
  ],
  flowers: [
    'Marigold', 'Rose', 'Jasmine', 'Tuberose', 'Chrysanthemum',
    'Gerbera', 'Lily', 'Anthurium', 'Carnation', 'Gladiolus',
  ],
  medicinal: [
    'Ashwagandha', 'Tulsi', 'Aloe Vera', 'Stevia', 'Mint (Pudina)',
    'Lemongrass', 'Senna', 'Isabgol (Psyllium)', 'Safed Musli', 'Brahmi',
    'Neem', 'Kalmegh',
  ],
  fodder: [
    'Napier Grass', 'Maize Fodder', 'Lucerne (Alfalfa)', 'Sudan Grass',
    'Teak (Timber)', 'Bamboo', 'Eucalyptus',
  ],
  aquaculture: [
    'Rohu Fish', 'Catla Fish', 'Tilapia', 'Freshwater Prawn',
    'Tiger Prawn', 'Vannamei Shrimp', 'Crab', 'Pearl (Mussel)',
  ],
}

// ─── STATES ───────────────────────────────────────────────────────────────────
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli',
  'Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep',
  'Puducherry',
]

// ─── UNITS ────────────────────────────────────────────────────────────────────
export const QUANTITY_UNITS = ['kg', 'quintal', 'tonne'] as const

// ─── LISTING ──────────────────────────────────────────────────────────────────
export const LISTING_EXPIRY_DAYS = 30
export const LISTING_ALERT_DAY = 25
