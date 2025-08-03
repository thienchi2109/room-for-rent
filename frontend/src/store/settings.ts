'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Settings, GeneralSettings, PricingSettings } from '@/../../shared/src/types/settings'

interface SettingsState {
  settings: Settings
  updateGeneralSettings: (settings: Partial<GeneralSettings>) => void
  updatePricingSettings: (settings: Partial<PricingSettings>) => void
  resetSettings: () => void
}

const defaultSettings: Settings = {
  general: {
    hotelName: 'NHÀ TRỌ HAPPY HOUSE',
    address: '',
    phoneNumber: '',
    email: ''
  },
  pricing: {
    electricityRate: 3500,
    waterRate: 25000,
    internetFee: 100000,
    cleaningFee: 50000
  }
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      
      updateGeneralSettings: (newSettings) => 
        set((state) => ({
          settings: {
            ...state.settings,
            general: { ...state.settings.general, ...newSettings }
          }
        })),
      
      updatePricingSettings: (newSettings) => 
        set((state) => ({
          settings: {
            ...state.settings,
            pricing: { ...state.settings.pricing, ...newSettings }
          }
        })),
      
      resetSettings: () => set({ settings: defaultSettings })
    }),
    {
      name: 'settings-storage'
    }
  )
)
