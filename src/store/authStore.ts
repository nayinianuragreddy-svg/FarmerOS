'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { FarmerProfile, BuyerProfile, CropListing, CropCategory } from '@/lib/types'

interface User {
  id: string
  phone: string
  active_role: 'farmer' | 'buyer'
  created_at: string
  is_new: boolean
}

interface Rating {
  id: string
  listing_id: string
  crop_name: string
  buyer_name: string
  stars: number
  comment?: string
  created_at: string
}

interface AuthState {
  user: User | null
  farmerProfile: FarmerProfile | null
  buyerProfile: BuyerProfile | null
  activeRole: 'farmer' | 'buyer'
  myListings: CropListing[]
  savedListingIds: string[]
  ratings: Rating[]

  // Auth actions
  login: (phone: string) => void
  logout: () => void
  setFarmerProfile: (p: Omit<FarmerProfile, 'id' | 'user_id' | 'rating_avg' | 'rating_count' | 'created_at'>) => void
  setBuyerProfile: (p: Omit<BuyerProfile, 'id' | 'user_id' | 'created_at'>) => void
  setActiveRole: (role: 'farmer' | 'buyer') => void
  markProfileComplete: () => void

  // Listing actions
  addListing: (listing: Omit<CropListing, 'id' | 'farmer_id' | 'status' | 'created_at' | 'expires_at'>) => CropListing
  updateListing: (id: string, data: Partial<CropListing>) => void
  deleteListing: (id: string) => void
  hideListing: (id: string) => void
  renewListing: (id: string) => void

  // Buyer actions
  toggleSaved: (listingId: string) => void
  updatePreferredCrops: (crops: CropCategory[]) => void
  addRating: (rating: Omit<Rating, 'id' | 'created_at'>) => void
}

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function expiresAt(days = 30) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      farmerProfile: null,
      buyerProfile: null,
      activeRole: 'buyer',
      myListings: [],
      savedListingIds: [],
      ratings: [],

      login: (phone: string) => {
        const existing = get().user
        if (existing?.phone === phone) return // already logged in
        set({
          user: {
            id: generateId(),
            phone,
            active_role: 'buyer',
            created_at: new Date().toISOString(),
            is_new: true,
          },
          activeRole: 'buyer',
        })
      },

      logout: () =>
        set({
          user: null,
          farmerProfile: null,
          buyerProfile: null,
          activeRole: 'buyer',
          myListings: [],
          savedListingIds: [],
          ratings: [],
        }),

      setFarmerProfile: (p) => {
        const user = get().user
        if (!user) return
        set({
          farmerProfile: {
            ...p,
            id: generateId(),
            user_id: user.id,
            rating_avg: 0,
            rating_count: 0,
            created_at: new Date().toISOString(),
          },
          activeRole: 'farmer',
        })
      },

      setBuyerProfile: (p) => {
        const user = get().user
        if (!user) return
        set({
          buyerProfile: {
            ...p,
            id: generateId(),
            user_id: user.id,
            created_at: new Date().toISOString(),
          },
          activeRole: 'buyer',
        })
      },

      setActiveRole: (role) => set({ activeRole: role }),

      markProfileComplete: () =>
        set(s => ({
          user: s.user ? { ...s.user, is_new: false } : null,
        })),

      addListing: (data) => {
        const user = get().user
        const farmer = get().farmerProfile
        if (!user || !farmer) throw new Error('Not authenticated as farmer')

        const listing: CropListing = {
          ...data,
          id: generateId(),
          farmer_id: user.id,
          status: 'active',
          created_at: new Date().toISOString(),
          expires_at: expiresAt(30),
          farmer: farmer,
        }
        set(s => ({ myListings: [listing, ...s.myListings] }))
        return listing
      },

      updateListing: (id, data) =>
        set(s => ({
          myListings: s.myListings.map(l => (l.id === id ? { ...l, ...data } : l)),
        })),

      deleteListing: (id) =>
        set(s => ({ myListings: s.myListings.filter(l => l.id !== id) })),

      hideListing: (id) =>
        set(s => ({
          myListings: s.myListings.map(l =>
            l.id === id ? { ...l, status: 'hidden' as const } : l,
          ),
        })),

      renewListing: (id) =>
        set(s => ({
          myListings: s.myListings.map(l =>
            l.id === id ? { ...l, status: 'active' as const, expires_at: expiresAt(30) } : l,
          ),
        })),

      toggleSaved: (listingId) =>
        set(s => ({
          savedListingIds: s.savedListingIds.includes(listingId)
            ? s.savedListingIds.filter(id => id !== listingId)
            : [...s.savedListingIds, listingId],
        })),

      updatePreferredCrops: (crops) =>
        set(s => ({
          buyerProfile: s.buyerProfile ? { ...s.buyerProfile, preferred_crops: crops } : null,
        })),

      addRating: (rating) =>
        set(s => ({
          ratings: [
            ...s.ratings,
            { ...rating, id: generateId(), created_at: new Date().toISOString() },
          ],
        })),
    }),
    {
      name: 'farmeros-auth',
      partialize: (s) => ({
        user: s.user,
        farmerProfile: s.farmerProfile,
        buyerProfile: s.buyerProfile,
        activeRole: s.activeRole,
        myListings: s.myListings,
        savedListingIds: s.savedListingIds,
        ratings: s.ratings,
      }),
    },
  ),
)
