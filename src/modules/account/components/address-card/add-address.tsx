"use client"

import { MapPin, Plus } from "@medusajs/icons"
import { Button, Heading, Text } from "@medusajs/ui"
import { useEffect, useMemo, useState, useActionState } from "react"

import useToggleState from "@lib/hooks/use-toggle-state"
import Modal from "@modules/common/components/modal"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { HttpTypes } from "@medusajs/types"
import { addCustomerAddress } from "@lib/data/customer"
import StoreMap from "./store-map"
import { STORE_LOCATIONS, StoreLocation } from "./store-locations"

const haversineDistance = (
  a: [number, number],
  b: [number, number]
): number => {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const [lat1, lon1] = a
  const [lat2, lon2] = b
  const R = 6371 // km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const lat1Rad = toRad(lat1)
  const lat2Rad = toRad(lat2)

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) ** 2

  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)))
}

const AddAddress = ({
  region,
  addresses,
  customer,
}: {
  region: HttpTypes.StoreRegion
  addresses: HttpTypes.StoreCustomerAddress[]
  customer: HttpTypes.StoreCustomer
}) => {
  const [successState, setSuccessState] = useState(false)
  const { state, open, close: closeModal } = useToggleState(false)
  const [selectedStore, setSelectedStore] = useState<StoreLocation | null>(
    STORE_LOCATIONS[0] || null
  )
  const [makeDefault, setMakeDefault] = useState(addresses.length === 0)

  const [formState, formAction] = useActionState(addCustomerAddress, {
    success: false,
    error: null,
    isDefaultShipping: addresses.length === 0,
    isDefaultBilling: false,
  })

  const close = () => {
    setSuccessState(false)
    closeModal()
  }

  useEffect(() => {
    if (successState) {
      close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successState])

  useEffect(() => {
    if (formState.success) {
      setSuccessState(true)
    }
  }, [formState])

  const customerLocation = useMemo(() => {
    const defaultShipping = addresses.find((addr) => addr.is_default_shipping)
    const baseAddress = defaultShipping || addresses[0]

    const lat = baseAddress?.metadata?.latitude as number | undefined
    const lon = baseAddress?.metadata?.longitude as number | undefined

    if (lat !== undefined && lon !== undefined) {
      return [lat, lon] as [number, number]
    }

    return null
  }, [addresses])

  const sortedStores = useMemo(() => {
    if (!customerLocation) return STORE_LOCATIONS

    return [...STORE_LOCATIONS].sort((a, b) => {
      const distA = haversineDistance(customerLocation, [
        a.coordinates.latitude,
        a.coordinates.longitude,
      ])
      const distB = haversineDistance(customerLocation, [
        b.coordinates.latitude,
        b.coordinates.longitude,
      ])

      return distA - distB
    })
  }, [customerLocation])

  useEffect(() => {
    if (sortedStores.length && !selectedStore) {
      setSelectedStore(sortedStores[0])
    }
  }, [sortedStores, selectedStore])

  return (
    <>
      <button
        className="border border-ui-border-base rounded-rounded p-5 min-h-[220px] h-full w-full flex flex-col justify-between"
        onClick={open}
        data-testid="add-address-button"
      >
        <span className="text-base-semi">Add store pickup</span>
        <Plus />
      </button>

      <Modal isOpen={state} close={close} data-testid="add-address-modal">
        <Modal.Title>
          <Heading className="mb-1">Select a pickup store</Heading>
          <Text size="small">
            Choose a nearby store to add it as a pickup address. Your address helps us
            sort the closest options first.
          </Text>
        </Modal.Title>
        <form action={formAction} className="flex flex-col gap-6">
          <Modal.Body>
            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <StoreMap
                  stores={sortedStores}
                  userLocation={customerLocation}
                  selectedStoreId={selectedStore?.id || null}
                  onSelect={(id) =>
                    setSelectedStore(sortedStores.find((store) => store.id === id) || null)
                  }
                />
              </div>
              <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-1">
                {sortedStores.map((store) => (
                  <button
                    key={store.id}
                    type="button"
                    onClick={() => setSelectedStore(store)}
                    className={`flex flex-col items-start gap-1 rounded-lg border p-4 text-left transition hover:border-ui-border-strong ${
                      selectedStore?.id === store.id
                        ? "border-ui-border-interactive bg-ui-bg-subtle"
                        : "border-ui-border-base"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin />
                        <Text className="font-semibold">{store.name}</Text>
                      </div>
                      {selectedStore?.id === store.id && (
                        <span className="text-xs font-semibold uppercase text-ui-fg-interactive">
                          Selected
                        </span>
                      )}
                    </div>
                    <Text size="small" className="text-ui-fg-muted">
                      {store.address_1}
                      {store.address_2 ? `, ${store.address_2}` : ""}
                    </Text>
                    <Text size="small" className="text-ui-fg-muted">
                      {store.city}, {store.province || region.name} {store.postal_code.toUpperCase()}
                    </Text>
                    <Text size="small" className="text-ui-fg-muted">{store.phone}</Text>
                  </button>
                ))}
              </div>
            </div>
            {formState.error && (
              <div className="text-rose-500 text-small-regular py-2" data-testid="address-error">
                {formState.error}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <input type="hidden" name="first_name" value={customer.first_name || "Pickup"} />
            <input type="hidden" name="last_name" value={customer.last_name || "Store"} />
            <input type="hidden" name="company" value={selectedStore?.name || ""} />
            <input type="hidden" name="address_1" value={selectedStore?.address_1 || ""} />
            <input type="hidden" name="address_2" value={selectedStore?.address_2 || ""} />
            <input type="hidden" name="city" value={selectedStore?.city || ""} />
            <input type="hidden" name="postal_code" value={selectedStore?.postal_code || ""} />
            <input type="hidden" name="province" value={selectedStore?.province || ""} />
            <input type="hidden" name="country_code" value={selectedStore?.country_code || region.countries[0]?.iso_2 || ""} />
            <input type="hidden" name="phone" value={selectedStore?.phone || customer.phone || ""} />
            <input type="hidden" name="is_default_shipping" value={makeDefault ? "true" : "false"} />
            <input
              type="hidden"
              name="metadata"
              value={selectedStore ? JSON.stringify({ store_id: selectedStore.id }) : ""}
            />
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={makeDefault}
                  onChange={(e) => setMakeDefault(e.target.checked)}
                  className="h-4 w-4 accent-ui-fg-interactive"
                  name="_set_default"
                />
                Set as default pickup address
              </label>
              <div className="flex gap-3">
                <Button type="reset" variant="secondary" onClick={close} className="h-10" data-testid="cancel-button">
                  Cancel
                </Button>
                <SubmitButton disabled={!selectedStore} data-testid="save-button">
                  Save store address
                </SubmitButton>
              </div>
            </div>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  )
}

export default AddAddress
