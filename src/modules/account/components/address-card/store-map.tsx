"use client"

import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect } from "react"
import { StoreLocation } from "./store-locations"

// Fix default marker assets for Next.js builds
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
})

const FlyToLocation = ({
  center,
}: {
  center: [number, number] | null
}): null => {
  const map = useMap()

  useEffect(() => {
    if (center) {
      map.flyTo(center, 12)
    }
  }, [center, map])

  return null
}

export type StoreMapProps = {
  stores: StoreLocation[]
  userLocation: [number, number] | null
  selectedStoreId: string | null
  onSelect: (storeId: string) => void
}

const StoreMap = ({
  stores,
  userLocation,
  selectedStoreId,
  onSelect,
}: StoreMapProps) => {
  const initialCenter: [number, number] =
    userLocation || [stores[0]?.coordinates.latitude || 0, stores[0]?.coordinates.longitude || 0]

  return (
    <div className="h-[340px] w-full overflow-hidden rounded-lg border border-ui-border-base bg-ui-bg-subtle">
      <MapContainer
        center={initialCenter}
        zoom={12}
        scrollWheelZoom={false}
        className="h-full w-full"
        dragging
        zoomControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userLocation && (
          <CircleMarker
            center={userLocation}
            radius={10}
            pathOptions={{ color: "#2563EB", fillColor: "#60A5FA", fillOpacity: 0.6 }}
          >
            <Tooltip direction="top" offset={[0, -4]} permanent>
              You
            </Tooltip>
          </CircleMarker>
        )}

        <FlyToLocation center={userLocation} />

        {stores.map((store) => (
          <Marker
            position={[store.coordinates.latitude, store.coordinates.longitude]}
            key={store.id}
            eventHandlers={{
              click: () => onSelect(store.id),
            }}
          >
            <Popup>
              <div className="flex flex-col gap-1 text-sm">
                <span className="font-semibold">{store.name}</span>
                <span>
                  {store.address_1}
                  {store.address_2 ? `, ${store.address_2}` : ""}
                </span>
                <span>
                  {store.city}, {store.province || ""} {store.postal_code}
                </span>
                <button
                  className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover text-left"
                  onClick={() => onSelect(store.id)}
                  type="button"
                >
                  {selectedStoreId === store.id ? "Selected" : "Select this store"}
                </button>
              </div>
            </Popup>
            {selectedStoreId === store.id && (
              <Tooltip direction="top" offset={[0, -12]} permanent>
                Selected store
              </Tooltip>
            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default StoreMap
