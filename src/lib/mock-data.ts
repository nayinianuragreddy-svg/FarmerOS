import { MapPin } from './types'

export const MOCK_PINS: MapPin[] = [
  // Telangana
  { id: '1', latitude: 17.385, longitude: 78.486, crop_name: 'Tomato', crop_category: 'vegetables', is_organic: false, images: [], district: 'Rangareddy', state: 'Telangana', quantity: 500, unit: 'kg', expected_price: 20, rating_avg: 4.2, status: 'active' },
  { id: '2', latitude: 18.312, longitude: 79.118, crop_name: 'Tur / Arhar (Pigeon Pea)', crop_category: 'pulses', is_organic: true, images: [], district: 'Karimnagar', state: 'Telangana', quantity: 20, unit: 'quintal', expected_price: 68, rating_avg: 4.8, status: 'active' },
  { id: '3', latitude: 16.504, longitude: 80.618, crop_name: 'Chilli (Guntur)', crop_category: 'spices', is_organic: false, images: [], district: 'Guntur', state: 'Andhra Pradesh', quantity: 10, unit: 'tonne', expected_price: 195, rating_avg: 4.5, status: 'active' },
  { id: '4', latitude: 17.688, longitude: 77.556, crop_name: 'Maize / Corn', crop_category: 'food_grains', is_organic: false, images: [], district: 'Nizamabad', state: 'Telangana', quantity: 50, unit: 'quintal', expected_price: 18, rating_avg: 3.9, status: 'active' },
  { id: '5', latitude: 16.930, longitude: 79.952, crop_name: 'Cotton - Long Staple', crop_category: 'cash_crops', is_organic: false, images: [], district: 'Nalgonda', state: 'Telangana', quantity: 15, unit: 'quintal', expected_price: 78, rating_avg: 4.1, status: 'active' },

  // Maharashtra
  { id: '6', latitude: 20.000, longitude: 73.780, crop_name: 'Grapes - Green', crop_category: 'fruits', is_organic: true, images: [], district: 'Nashik', state: 'Maharashtra', quantity: 2, unit: 'tonne', expected_price: 55, rating_avg: 4.9, status: 'active' },
  { id: '7', latitude: 18.515, longitude: 73.856, crop_name: 'Onion', crop_category: 'vegetables', is_organic: false, images: [], district: 'Pune', state: 'Maharashtra', quantity: 5, unit: 'tonne', expected_price: 14, rating_avg: 4.3, status: 'active' },
  { id: '8', latitude: 19.997, longitude: 75.338, crop_name: 'Pomegranate', crop_category: 'fruits', is_organic: true, images: [], district: 'Aurangabad', state: 'Maharashtra', quantity: 1, unit: 'tonne', expected_price: 90, rating_avg: 4.7, status: 'active' },
  { id: '9', latitude: 17.688, longitude: 74.254, crop_name: 'Sugarcane', crop_category: 'cash_crops', is_organic: false, images: [], district: 'Sangli', state: 'Maharashtra', quantity: 30, unit: 'tonne', expected_price: 3, rating_avg: 4.0, status: 'active' },

  // Karnataka
  { id: '10', latitude: 12.971, longitude: 77.594, crop_name: 'Rose', crop_category: 'flowers', is_organic: false, images: [], district: 'Bengaluru Rural', state: 'Karnataka', quantity: 800, unit: 'kg', expected_price: 12, rating_avg: 4.6, status: 'active' },
  { id: '11', latitude: 12.338, longitude: 76.618, crop_name: 'Coffee - Arabica', crop_category: 'plantation', is_organic: true, images: [], district: 'Mysuru', state: 'Karnataka', quantity: 500, unit: 'kg', expected_price: 380, rating_avg: 4.8, status: 'active' },
  { id: '12', latitude: 15.853, longitude: 74.497, crop_name: 'Groundnut', crop_category: 'oilseeds', is_organic: false, images: [], district: 'Dharwad', state: 'Karnataka', quantity: 10, unit: 'quintal', expected_price: 68, rating_avg: 3.7, status: 'active' },
  { id: '13', latitude: 14.678, longitude: 76.978, crop_name: 'Mango - Banganapalli', crop_category: 'fruits', is_organic: false, images: [], district: 'Ballari', state: 'Karnataka', quantity: 3, unit: 'tonne', expected_price: 45, rating_avg: 4.4, status: 'active' },

  // Punjab & Haryana
  { id: '14', latitude: 30.900, longitude: 75.857, crop_name: 'Wheat - Sharbati', crop_category: 'food_grains', is_organic: false, images: [], district: 'Ludhiana', state: 'Punjab', quantity: 100, unit: 'quintal', expected_price: 25, rating_avg: 4.2, status: 'active' },
  { id: '15', latitude: 31.326, longitude: 75.576, crop_name: 'Rice - Basmati', crop_category: 'food_grains', is_organic: false, images: [], district: 'Amritsar', state: 'Punjab', quantity: 80, unit: 'quintal', expected_price: 42, rating_avg: 4.5, status: 'active' },
  { id: '16', latitude: 29.068, longitude: 76.084, crop_name: 'Mustard / Rapeseed', crop_category: 'oilseeds', is_organic: false, images: [], district: 'Hisar', state: 'Haryana', quantity: 25, unit: 'quintal', expected_price: 52, rating_avg: 3.8, status: 'active' },

  // UP
  { id: '17', latitude: 26.846, longitude: 80.946, crop_name: 'Potato', crop_category: 'vegetables', is_organic: false, images: [], district: 'Lucknow', state: 'Uttar Pradesh', quantity: 10, unit: 'tonne', expected_price: 16, rating_avg: 4.1, status: 'active' },
  { id: '18', latitude: 27.176, longitude: 78.007, crop_name: 'Mango - Langra', crop_category: 'fruits', is_organic: false, images: [], district: 'Agra', state: 'Uttar Pradesh', quantity: 4, unit: 'tonne', expected_price: 40, rating_avg: 4.6, status: 'active' },

  // Tamil Nadu
  { id: '19', latitude: 11.127, longitude: 78.657, crop_name: 'Turmeric', crop_category: 'spices', is_organic: true, images: [], district: 'Salem', state: 'Tamil Nadu', quantity: 5, unit: 'quintal', expected_price: 160, rating_avg: 4.7, status: 'active' },
  { id: '20', latitude: 10.790, longitude: 77.047, crop_name: 'Banana', crop_category: 'fruits', is_organic: false, images: [], district: 'Coimbatore', state: 'Tamil Nadu', quantity: 3, unit: 'tonne', expected_price: 22, rating_avg: 4.3, status: 'active' },
  { id: '21', latitude: 8.713, longitude: 77.758, crop_name: 'Rohu Fish', crop_category: 'aquaculture', is_organic: false, images: [], district: 'Tirunelveli', state: 'Tamil Nadu', quantity: 200, unit: 'kg', expected_price: 130, rating_avg: 4.0, status: 'active' },

  // Rajasthan
  { id: '22', latitude: 26.915, longitude: 70.902, crop_name: 'Cumin (Jeera)', crop_category: 'spices', is_organic: false, images: [], district: 'Barmer', state: 'Rajasthan', quantity: 15, unit: 'quintal', expected_price: 250, rating_avg: 4.4, status: 'active' },
  { id: '23', latitude: 26.450, longitude: 74.637, crop_name: 'Bajra (Pearl Millet)', crop_category: 'food_grains', is_organic: false, images: [], district: 'Ajmer', state: 'Rajasthan', quantity: 30, unit: 'quintal', expected_price: 22, rating_avg: 3.9, status: 'active' },

  // Kerala
  { id: '24', latitude: 10.527, longitude: 76.215, crop_name: 'Black Pepper', crop_category: 'spices', is_organic: true, images: [], district: 'Thrissur', state: 'Kerala', quantity: 3, unit: 'quintal', expected_price: 420, rating_avg: 4.9, status: 'active' },
  { id: '25', latitude: 9.939, longitude: 76.270, crop_name: 'Coconut', crop_category: 'plantation', is_organic: false, images: [], district: 'Ernakulam', state: 'Kerala', quantity: 5000, unit: 'kg', expected_price: 20, rating_avg: 4.2, status: 'active' },

  // MP
  { id: '26', latitude: 23.259, longitude: 77.412, crop_name: 'Soybean', crop_category: 'oilseeds', is_organic: false, images: [], district: 'Bhopal', state: 'Madhya Pradesh', quantity: 20, unit: 'quintal', expected_price: 46, rating_avg: 4.0, status: 'active' },
  { id: '27', latitude: 22.718, longitude: 75.855, crop_name: 'Ashwagandha', crop_category: 'medicinal', is_organic: true, images: [], district: 'Indore', state: 'Madhya Pradesh', quantity: 8, unit: 'quintal', expected_price: 220, rating_avg: 4.7, status: 'active' },

  // Gujarat
  { id: '28', latitude: 22.307, longitude: 70.801, crop_name: 'Groundnut', crop_category: 'oilseeds', is_organic: false, images: [], district: 'Rajkot', state: 'Gujarat', quantity: 15, unit: 'quintal', expected_price: 67, rating_avg: 4.3, status: 'active' },
  { id: '29', latitude: 23.033, longitude: 72.585, crop_name: 'Cotton - Short Staple', crop_category: 'cash_crops', is_organic: false, images: [], district: 'Ahmedabad', state: 'Gujarat', quantity: 25, unit: 'quintal', expected_price: 60, rating_avg: 3.8, status: 'active' },

  // Assam
  { id: '30', latitude: 26.244, longitude: 92.537, crop_name: 'Tea - Assam', crop_category: 'plantation', is_organic: false, images: [], district: 'Dibrugarh', state: 'Assam', quantity: 1, unit: 'tonne', expected_price: 320, rating_avg: 4.8, status: 'active' },
]
