export type StoreLocation = {
  id: string
  name: string
  address_1: string
  address_2?: string
  city: string
  postal_code: string
  province?: string
  country_code: string
  phone?: string
  coordinates: {
    latitude: number
    longitude: number
  }
}

export const STORE_LOCATIONS: StoreLocation[] = [
  {
    id: "store-soho",
    name: "SoHo Pickup Shop",
    address_1: "120 Greene St",
    address_2: "",
    city: "New York",
    postal_code: "10012",
    province: "NY",
    country_code: "us",
    phone: "+1 917-555-0101",
    coordinates: {
      latitude: 40.724174,
      longitude: -73.999444,
    },
  },
  {
    id: "store-brooklyn",
    name: "Brooklyn Pickup Hub",
    address_1: "68 Jay St",
    address_2: "Suite 502",
    city: "Brooklyn",
    postal_code: "11201",
    province: "NY",
    country_code: "us",
    phone: "+1 917-555-0145",
    coordinates: {
      latitude: 40.703341,
      longitude: -73.986227,
    },
  },
  {
    id: "store-jersey",
    name: "Jersey City Pickup",
    address_1: "95 Hudson St",
    city: "Jersey City",
    postal_code: "07302",
    province: "NJ",
    country_code: "us",
    phone: "+1 862-555-0199",
    coordinates: {
      latitude: 40.717472,
      longitude: -74.03383,
    },
  },
]
