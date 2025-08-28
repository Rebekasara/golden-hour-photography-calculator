"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { generateSEOFriendlyURL, formatDateForURL } from "@/lib/url-utils"

interface Location {
  lat: number
  lng: number
  name: string
}

interface GoldenHourCalculatorProps {
  initialLocation?: Location
  initialDate?: Date | null
}

export default function GoldenHourCalculator({ initialLocation, initialDate }: GoldenHourCalculatorProps) {
  const router = useRouter()
  const [currentLocation, setCurrentLocation] = useState<Location | null>(initialLocation || null)
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate || new Date())

  // Update URL when location or date changes
  useEffect(() => {
    if (currentLocation && typeof window !== "undefined") {
      const newURL = generateSEOFriendlyURL({
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        locationName: currentLocation.name,
        date: formatDateForURL(selectedDate),
      })

      // Only update URL if it's different from current path
      if (window.location.pathname !== newURL) {
        router.replace(newURL)
      }
    }
  }, [currentLocation, selectedDate, router])

  const handleLocationChange = (location: Location) => {
    setCurrentLocation(location)
  }

  const handleDateChange = (date: Date) => {
    setSelectedDate(date)
  }

  // Import and render the existing page content
  // This would contain all the existing golden hour calculator logic
  return (
    <div>
      {/* All existing page content would go here */}
      <div className="container mx-auto px-4 py-8">
        <h1>Golden Hour Calculator</h1>
        {currentLocation && (
          <p>
            Location: {currentLocation.name} ({currentLocation.lat}, {currentLocation.lng})
          </p>
        )}
        <p>Date: {selectedDate.toLocaleDateString()}</p>
        {/* Rest of the calculator UI */}
      </div>
    </div>
  )
}