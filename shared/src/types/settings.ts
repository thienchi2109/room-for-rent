export interface GeneralSettings {
  hotelName: string
  address: string
  phoneNumber: string
  email: string
}

export interface PricingSettings {
  electricityRate: number
  waterRate: number
  internetFee: number
  cleaningFee: number
}

export interface Settings {
  general: GeneralSettings
  pricing: PricingSettings
}

export type SettingsType = keyof Settings
