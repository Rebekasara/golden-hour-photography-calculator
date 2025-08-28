"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Search, Clock, X } from "lucide-react"
import { LocationDisplayUtils } from "@/lib/location-display-utils"

interface LocationData {
  city: string
  country: string
  state?: string
  region?: string
  postal?: string
  address?: string
  lat: number
  lon: number
  timezone: string
  accuracy?: string
}

interface SearchResult {
  display_name: string
  lat: string
  lon: string
  address: {
    city?: string
    town?: string
    village?: string
    country?: string
    state?: string
    postcode?: string
  }
}

interface AdvancedLocationSearchProps {
  onLocationSelect: (location: LocationData) => void
  currentLocation: LocationData | null
  onAutoDetect: () => void
  autoDetecting: boolean
}

export default function AdvancedLocationSearch({
  onLocationSelect,
  currentLocation,
  onAutoDetect,
  autoDetecting,
}: AdvancedLocationSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()
  const inputRef = useRef<HTMLInputElement>(null)

  // Update search query when current location changes
  useEffect(() => {
    if (currentLocation && !searchQuery) {
      setSearchQuery(currentLocation.address || `${currentLocation.city}, ${currentLocation.country}`)
    }
  }, [currentLocation, searchQuery])

  // Debounced search function
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (searchQuery.length > 2) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(searchQuery)
      }, 300)
    } else {
      setSearchResults([])
      setShowResults(false)
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  const performSearch = async (query: string) => {
    if (!query.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query,
        )}&limit=5&addressdetails=1&countrycodes=&dedupe=1`,
      )
      const results = await response.json()
      setSearchResults(results)
      setShowResults(true)
      setSelectedIndex(-1)
    } catch (error) {
      console.error("Search failed:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleResultSelect = (result: SearchResult) => {
    const locationData: LocationData = {
      city: result.address.city || result.address.town || result.address.village || "Unknown City",
      country: result.address.country || "Unknown Country",
      state: result.address.state,
      postal: result.address.postcode,
      address: result.display_name,
      lat: Number.parseFloat(result.lat),
      lon: Number.parseFloat(result.lon),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      accuracy: "Search result",
    }

    setSearchQuery(result.display_name)
    setShowResults(false)
    onLocationSelect(locationData)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || searchResults.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : prev))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          handleResultSelect(searchResults[selectedIndex])
        }
        break
      case "Escape":
        setShowResults(false)
        setSelectedIndex(-1)
        break
    }
  }

  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
    setShowResults(false)
    inputRef.current?.focus()
  }

  return (
    <div className="relative">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-base font-medium flex items-center gap-2 text-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            Location
          </label>
          <Button
            variant="ghost"
            size="sm"
            onClick={onAutoDetect}
            disabled={autoDetecting}
            className="text-xs h-6 px-2 hover:bg-primary/10 transition-colors"
            title="Detect current location"
          >
            <Navigation className={`w-3 h-3 mr-1 ${autoDetecting ? "animate-pulse" : ""}`} />
            {autoDetecting ? "Detecting..." : "Current Location"}
          </Button>
        </div>

        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search for a city, address, or coordinates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
              className="h-12 pl-10 pr-10 text-base border-2 focus:border-primary transition-all duration-200"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            )}
          </div>

          <AnimatePresence>
            {showResults && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 z-50 mt-1 bg-white/98 backdrop-blur-sm border border-border rounded-lg shadow-2xl max-h-64 overflow-y-auto"
              >
                {searchResults.map((result, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleResultSelect(result)}
                    className={`w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors border-b border-border/50 last:border-b-0 ${
                      selectedIndex === index ? "bg-primary/10" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground text-sm truncate">
                          {result.address.city || result.address.town || result.address.village || "Unknown Location"}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {result.address.state && `${result.address.state}, `}
                          {result.address.country}
                        </div>
                        <div className="text-xs text-muted-foreground/60 mt-1 truncate">
                          {result.display_name}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {currentLocation && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
            <Clock className="w-3 h-3" />
            <span>
              Current: {LocationDisplayUtils.getShortDisplayName(currentLocation)}
              {currentLocation.accuracy && ` • ${currentLocation.accuracy}`}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}