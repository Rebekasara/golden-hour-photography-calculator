"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MapPin, Search, Calendar, X, ChevronDown, Target } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
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

interface CompactSearchBarProps {
  onLocationSelect: (location: LocationData) => void
  onDateSelect: (date: string) => void
  onSearch: () => void
  currentLocation: LocationData | null
  currentDate: string
  onAutoDetect: () => void
  autoDetecting: boolean
  loading: boolean
}

function CompactSearchBar({
  onLocationSelect,
  onDateSelect,
  onSearch,
  currentLocation,
  currentDate,
  onAutoDetect,
  autoDetecting,
  loading,
}: CompactSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [activeField, setActiveField] = useState<"location" | "date" | null>(null)
  const [manuallyCleared, setManuallyCleared] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dateRef = useRef<HTMLInputElement>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    // Only auto-fill when there's a new location and no existing query
    // Don't auto-fill if user has manually cleared or is actively searching
    if (currentLocation && !searchQuery && !manuallyCleared && activeField !== "location") {
      setSearchQuery(LocationDisplayUtils.getDisplayName(currentLocation))
    }
  }, [currentLocation, searchQuery, manuallyCleared, activeField])

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
    console.log('performSearch called with query:', query) // Debug log
    if (!query.trim()) {
      console.log('Query is empty, returning early') // Debug log
      return
    }

    console.log('Starting search...') // Debug log
    setIsSearching(true)
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query,
      )}&limit=5&addressdetails=1&countrycodes=&dedupe=1&accept-language=en`
      console.log('Fetching URL:', url) // Debug log
      
      const response = await fetch(url)
      console.log('Response status:', response.status) // Debug log
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const results = await response.json()
      console.log('Search results received:', results.length, 'items') // Debug log
      console.log('First result:', results[0]) // Debug log
      
      setSearchResults(results || [])
      setShowResults(true)
      setSelectedIndex(-1)
      console.log('Search state updated') // Debug log
    } catch (error) {
      console.error("Search failed:", error)
      setSearchResults([])
      setShowResults(false)
    } finally {
      setIsSearching(false)
      console.log('Search completed') // Debug log
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
    setActiveField(null)
    setManuallyCleared(false) // Reset when user selects a new location
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
        setActiveField(null)
        break
    }
  }

  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
    setShowResults(false)
    setActiveField(null)
    setManuallyCleared(true)
    inputRef.current?.focus()
  }

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return "Add dates"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getLocationDisplay = () => {
    if (searchQuery) {
      const maxLength = isMobile ? 15 : 25
      if (searchQuery.length > maxLength) {
        return searchQuery.substring(0, maxLength - 3) + "..."
      }
      return searchQuery
    }

    if (currentLocation) {
      return LocationDisplayUtils.getDisplayName(currentLocation, isMobile)
    }

    return "Search destinations"
  }

  return (
    <div className="relative">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-white border border-gray-200 rounded-2xl sm:rounded-full shadow-md hover:shadow-lg hover:border-gray-300 transition-all duration-300 overflow-hidden w-full">
        <div
          role="button"
          tabIndex={0}
          aria-label="Select location"
          aria-expanded={activeField === "location"}
          className={`flex-1 max-w-none sm:max-w-[250px] px-4 sm:px-5 py-4 sm:py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
            activeField === "location" ? "bg-gray-50" : ""
          }`}
          onClick={() => {
            console.log('Location button clicked, current activeField:', activeField) // Debug log
            const newActiveField = activeField === "location" ? null : "location"
            setActiveField(newActiveField)
            // Don't reset manuallyCleared when just opening the search field
            console.log('Setting activeField to:', newActiveField) // Debug log
            if (newActiveField === "location") {
              setTimeout(() => {
                console.log('Focusing input field') // Debug log
                inputRef.current?.focus()
              }, 100)
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              setActiveField(activeField === "location" ? null : "location")
              // Don't reset manuallyCleared when just opening the search field
              setTimeout(() => inputRef.current?.focus(), 100)
            }
          }}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex-shrink-0">
              <MapPin className="w-5 h-5 sm:w-4 sm:h-4 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="text-xs sm:text-xs text-gray-500 font-medium">Where</div>
              <div
                className={`text-base sm:text-sm font-medium truncate overflow-hidden text-ellipsis whitespace-nowrap ${
                  !searchQuery && !currentLocation ? "text-gray-400" : "text-gray-900"
                }`}
              >
                {getLocationDisplay()}
              </div>
            </div>
            <ChevronDown
              className={`w-5 h-5 sm:w-4 sm:h-4 text-gray-400 transition-transform flex-shrink-0 ${
                activeField === "location" ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>

        <div className="hidden sm:block w-px h-6 bg-gray-200"></div>

        <div className="flex-shrink-0 w-auto sm:w-auto px-4 py-3 sm:px-3 sm:py-3 border-t sm:border-t-0 border-gray-200 sm:border-0">
          <Button
            onClick={onAutoDetect}
            disabled={autoDetecting}
            aria-label="Detect current location"
            className="w-full sm:w-auto min-h-[44px] sm:min-h-[32px] h-11 sm:h-8 px-3 sm:px-3 text-sm sm:text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 bg-transparent border-0 hover:border-0 transition-all duration-300 rounded-full sm:rounded-full min-w-0"
            title="Detect current location"
          >
            <div className="flex items-center justify-center gap-2 sm:gap-1">
              <Target className={`w-4 h-4 sm:w-4 sm:h-4 ${autoDetecting ? "animate-pulse" : ""}`} />
              <span className="hidden sm:inline whitespace-nowrap">{autoDetecting ? "Locating..." : "Locate Me"}</span>
              <span className="sm:hidden">{autoDetecting ? "Locating..." : "Current"}</span>
            </div>
          </Button>
        </div>

        <div className="hidden sm:block w-px h-6 bg-gray-200"></div>

        <div
          role="button"
          tabIndex={0}
          aria-label="Select date"
          aria-expanded={activeField === "date"}
          className={`flex-1 max-w-none sm:max-w-[160px] px-4 sm:px-5 py-4 sm:py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
            activeField === "date" ? "bg-gray-50" : ""
          }`}
          onClick={() => {
            setActiveField(activeField === "date" ? null : "date")
            setTimeout(() => dateRef.current?.focus(), 100)
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              setActiveField(activeField === "date" ? null : "date")
              setTimeout(() => dateRef.current?.focus(), 100)
            }
          }}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex-shrink-0">
              <Calendar className="w-5 h-5 sm:w-4 sm:h-4 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs sm:text-xs text-gray-500 font-medium">When</div>
              <div
                className={`text-base sm:text-sm font-medium truncate ${
                  !currentDate ? "text-gray-400" : "text-gray-900"
                }`}
              >
                {formatDateDisplay(currentDate)}
              </div>
            </div>
            <ChevronDown
              className={`w-5 h-5 sm:w-4 sm:h-4 text-gray-400 transition-transform flex-shrink-0 ${
                activeField === "date" ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>

        <div className="flex-shrink-0 w-auto sm:w-auto px-4 py-3 sm:px-3 sm:py-2 border-t sm:border-t-0 border-gray-200 sm:border-0">
          <Button
            onClick={onSearch}
            disabled={loading || (!searchQuery && !currentLocation) || !currentDate}
            aria-label="Search for golden hour times"
            className="w-full sm:w-auto min-h-[48px] sm:min-h-[40px] h-12 sm:h-10 bg-red-500 hover:bg-red-600 text-white rounded-xl sm:rounded-full px-4 sm:px-4 py-3 sm:py-2.5 font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-sm hover:shadow-md whitespace-nowrap"
          >
            {loading ? (
              <div className="w-5 h-5 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Search className="w-5 h-5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Search</span>
              </div>
            )}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {activeField === "location" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 z-50 mt-2 sm:mt-2 bg-white rounded-2xl sm:rounded-xl shadow-xl border border-gray-200 p-4 sm:p-4 max-h-[80vh] sm:max-h-none overflow-y-auto"
          >
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 sm:left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 sm:w-4 sm:h-4 text-gray-400" />
                <Input
                  ref={inputRef}
                  placeholder="Search for a city, address, or coordinates..."
                  value={searchQuery}
                  onChange={(e) => {
                    const value = e.target.value
                    console.log('Search input changed:', value) // Debug log
                    setSearchQuery(value)
                    if (activeField !== "location") {
                      setActiveField("location")
                    }
                    // Ensure dropdown shows when typing
                    if (value.length > 0) {
                      setShowResults(true)
                    }
                  }}
                  onFocus={() => {
                    console.log('Input field focused, current activeField:', activeField) // Debug log
                    if (activeField !== "location") {
                      console.log('Setting activeField to location from onFocus') // Debug log
                      setActiveField("location")
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  aria-label="Location search"
                  aria-autocomplete="list"
                  aria-controls="search-results"
                  aria-expanded={showResults}
                  className="h-12 sm:h-11 pl-12 sm:pl-10 pr-12 sm:pr-10 text-base sm:text-sm border border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-xl sm:rounded-lg transition-all duration-200"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    aria-label="Clear search"
                    className="absolute right-2 sm:right-2 top-1/2 transform -translate-y-1/2 min-h-[32px] min-w-[32px] h-8 w-8 sm:h-6 sm:w-6 p-0 hover:bg-gray-100"
                  >
                    <X className="w-4 h-4 sm:w-3 sm:h-3" />
                  </Button>
                )}
                {isSearching && (
                  <div className="absolute right-3 sm:right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-5 h-5 sm:w-4 sm:h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                  </div>
                )}
              </div>

              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    id="search-results"
                    role="listbox"
                    aria-label="Search results"
                    className="max-h-60 sm:max-h-60 overflow-y-auto space-y-2 sm:space-y-1"
                  >
                    {searchResults.map((result, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleResultSelect(result)}
                        role="option"
                        aria-selected={selectedIndex === index}
                        className={`w-full text-left px-4 py-3 sm:px-3 sm:py-2.5 hover:bg-gray-50 transition-colors rounded-xl sm:rounded-lg min-h-[44px] ${
                          selectedIndex === index ? "bg-red-50 border border-red-200" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3 sm:gap-3">
                          <MapPin className="w-5 h-5 sm:w-4 sm:h-4 text-gray-400 mt-0.5 sm:mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 text-base sm:text-sm truncate">
                              {result.address.city ||
                                result.address.town ||
                                result.address.village ||
                                "Unknown Location"}
                            </div>
                            <div className="text-sm sm:text-xs text-gray-500 truncate">
                              {result.address.state && `${result.address.state}, `}
                              {result.address.country}
                            </div>
                            <div className="text-sm sm:text-xs text-gray-400 mt-1 truncate">{result.display_name}</div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {currentLocation && (
                <div className="flex items-center gap-2 text-sm sm:text-xs text-gray-500 bg-gray-50 rounded-xl sm:rounded-lg px-4 py-3 sm:px-3 sm:py-2">
                  <MapPin className="w-4 h-4 sm:w-3 sm:h-3" />
                  <span className="leading-relaxed">
                    Current: {currentLocation.city}, {currentLocation.country}
                    {currentLocation.accuracy && ` • ${currentLocation.accuracy}`}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeField === "date" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 z-50 mt-2 sm:mt-2 bg-white rounded-2xl sm:rounded-xl shadow-xl border border-gray-200 p-4 sm:p-4 w-full sm:w-80"
          >
            <div className="space-y-4">
              <div className="text-base sm:text-sm font-medium text-gray-900">Select Date</div>
              <Input
                ref={dateRef}
                type="date"
                value={currentDate}
                onChange={(e) => {
                  onDateSelect(e.target.value)
                  setActiveField(null)
                }}
                className="h-12 sm:h-11 text-base sm:text-sm border border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-xl sm:rounded-lg transition-all duration-200"
                min={new Date().toISOString().split("T")[0]}
              />
              <div className="text-sm sm:text-xs text-gray-500 leading-relaxed">
                Choose a date to calculate golden hour times for your location. The golden hour occurs shortly after
                sunrise and before sunset, providing perfect lighting for photography.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {activeField && (
        <div
          className="fixed inset-0 z-40 sm:z-40"
          onClick={() => setActiveField(null)}
          style={{
            WebkitTapHighlightColor: "transparent",
            WebkitTouchCallout: "none",
            WebkitUserSelect: "none",
            userSelect: "none",
          }}
        />
      )}
    </div>
  )
}

export { CompactSearchBar }