"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import {
  Sun,
  Moon,
  Compass,
  Navigation,
  Clock,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize,
  Minimize,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Layers,
  Eye,
  EyeOff,
} from "lucide-react"
import { sunCalculator } from "@/lib/sun-calculator"

// Dynamic imports to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false })
const Polyline = dynamic(() => import("react-leaflet").then((mod) => mod.Polyline), { ssr: false })
const Circle = dynamic(() => import("react-leaflet").then((mod) => mod.Circle), { ssr: false })
const useMap = dynamic(() => import("react-leaflet").then((mod) => mod.useMap), { ssr: false })

interface EnhancedInteractiveMapProps {
  location: {
    lat: number
    lng: number
    name: string
  }
  date: Date
  className?: string
}

interface SunPosition {
  azimuth: number
  altitude: number
  distance: number
}

interface SunPathPoint {
  time: string
  azimuth: number
  altitude: number
  lat: number
  lng: number
}

interface MapLayer {
  id: string
  name: string
  url: string
  attribution: string
}

export default function EnhancedInteractiveMap({ location, date, className }: EnhancedInteractiveMapProps) {
  const [sunPosition, setSunPosition] = useState<SunPosition>({ azimuth: 0, altitude: 0, distance: 0 })
  const [selectedTime, setSelectedTime] = useState("12:00")
  const [mapLayer, setMapLayer] = useState("street")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [mapLoading, setMapLoading] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)
  const [sunPath, setSunPath] = useState<SunPathPoint[]>([])
  const [showDayNightTerminator, setShowDayNightTerminator] = useState(true)
  const [showSunDial, setShowSunDial] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [mapKey, setMapKey] = useState(0)

  // Initialize Leaflet icons and detect mobile
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMobile(window.innerWidth < 768)
      const L = require("leaflet")
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "/leaflet/marker-icon-2x.png",
        iconUrl: "/leaflet/marker-icon.png",
        shadowUrl: "/leaflet/marker-shadow.png",
      })
    }
  }, [])

  // Handle map loading errors
  const handleMapError = useCallback(() => {
    console.error("Map failed to load")
    setMapLoading(false)
  }, [])

  // Map layers configuration
  const mapLayers: MapLayer[] = [
    {
      id: "street",
      name: "Street",
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
    {
      id: "satellite",
      name: "Satellite",
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    },
    {
      id: "terrain",
      name: "Terrain",
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    },
    {
      id: "dark",
      name: "Dark",
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    },
  ]

  // Time options for sun position calculation
  const timeOptions = [
    "00:00", "01:00", "02:00", "03:00", "04:00", "05:00",
    "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
    "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
    "18:00", "19:00", "20:00", "21:00", "22:00", "23:00",
  ]

  // Force remount map when location changes
  useEffect(() => {
    setMapKey(prev => prev + 1)
  }, [location.lat, location.lng])

  // Calculate sun position based on date and selected time
  useEffect(() => {
    const [hours, minutes] = selectedTime.split(":").map(Number)
    const calculationDate = new Date(date)
    calculationDate.setHours(hours, minutes, 0, 0)

    const position = sunCalculator.getSunPosition(calculationDate, location.lat, location.lng)
    setSunPosition({
      azimuth: (position.azimuth * 180) / Math.PI + 180, // Convert to degrees and adjust
      altitude: (position.altitude * 180) / Math.PI, // Convert to degrees
      distance: 1, // Sun distance is effectively infinite
    })
  }, [date, selectedTime, location])

  // Animation control
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isAnimating) {
      interval = setInterval(() => {
        setSelectedTime((prev) => {
          const currentIndex = timeOptions.indexOf(prev)
          const nextIndex = (currentIndex + 1) % timeOptions.length
          return timeOptions[nextIndex]
        })
      }, 500) // Change time every 500ms
    }
    return () => clearInterval(interval)
  }, [isAnimating, timeOptions])

  // Calculate sun path for the entire day
  const calculateSunPath = useCallback(() => {
    const path: SunPathPoint[] = []
    timeOptions.forEach((time) => {
      const [hours, minutes] = time.split(":").map(Number)
      const calculationDate = new Date(date)
      calculationDate.setHours(hours, minutes, 0, 0)

      const position = sunCalculator.getSunPosition(calculationDate, location.lat, location.lng)
      const azimuth = (position.azimuth * 180) / Math.PI + 180
      const altitude = (position.altitude * 180) / Math.PI

      // Calculate approximate position on map (this is a simplified calculation)
      const distance = 0.01 // Arbitrary distance for visualization
      const azimuthRad = (azimuth * Math.PI) / 180
      const lat = location.lat + distance * Math.cos(azimuthRad)
      const lng = location.lng + distance * Math.sin(azimuthRad)

      path.push({
        time,
        azimuth,
        altitude,
        lat,
        lng,
      })
    })
    return path
  }, [date, location, timeOptions])

  // Calculate day/night terminator (simplified)
  const calculateDayNightTerminator = useCallback(() => {
    // This is a simplified calculation for demonstration
    // In reality, this would require more complex solar calculations
    const terminator: [number, number][] = []
    for (let lat = -90; lat <= 90; lat += 10) {
      // Simplified calculation - in reality this would be much more complex
      const lng = location.lng + (sunPosition.azimuth - 180) / 4
      terminator.push([lat, lng])
    }
    return terminator
  }, [location.lng, sunPosition.azimuth])

  // Update sun path when dependencies change
  useEffect(() => {
    setSunPath(calculateSunPath())
  }, [calculateSunPath])

  // Map control handlers
  const handleResetView = () => {
    setMapKey(prev => prev + 1)
  }

  const handleZoomIn = () => {
    // This would be handled by the map instance
    console.log("Zoom in")
  }

  const handleZoomOut = () => {
    // This would be handled by the map instance
    console.log("Zoom out")
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // Animation controls
  const toggleAnimation = () => {
    setIsAnimating(!isAnimating)
  }

  const stepBackward = () => {
    const currentIndex = timeOptions.indexOf(selectedTime)
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : timeOptions.length - 1
    setSelectedTime(timeOptions[prevIndex])
  }

  const stepForward = () => {
    const currentIndex = timeOptions.indexOf(selectedTime)
    const nextIndex = (currentIndex + 1) % timeOptions.length
    setSelectedTime(timeOptions[nextIndex])
  }

  // Calculate sun position on map
  const sunPositionOnMap = useMemo(() => {
    const distance = 0.01 // Arbitrary distance for visualization
    const azimuthRad = (sunPosition.azimuth * Math.PI) / 180
    return {
      lat: location.lat + distance * Math.cos(azimuthRad),
      lng: location.lng + distance * Math.sin(azimuthRad),
    }
  }, [location, sunPosition.azimuth])

  // Helper functions
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getSunIntensity = (altitude: number) => {
    if (altitude <= 0) return "Below horizon"
    if (altitude < 10) return "Golden hour"
    if (altitude < 30) return "Soft light"
    if (altitude < 60) return "Bright light"
    return "Harsh light"
  }

  const getShadowLength = (altitude: number) => {
    if (altitude <= 0) return "No shadows"
    if (altitude < 10) return "Very long"
    if (altitude < 30) return "Long"
    if (altitude < 60) return "Medium"
    return "Short"
  }

  const dayNightTerminator = calculateDayNightTerminator()

  if (typeof window === "undefined") {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="w-5 h-5" />
            Interactive Sun Position Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`${className} ${isFullscreen ? "fixed inset-0 z-50" : ""}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sun className="w-5 h-5" />
            Interactive Sun Position Map
            <Badge variant="secondary" className="ml-2">
              {location.name}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleResetView}>
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Map Controls */}
        <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/50 rounded-lg">
          {/* Animation Controls */}
          <div className="flex items-center gap-1 border-r border-border pr-2">
            <Button variant="ghost" size="sm" onClick={stepBackward}>
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleAnimation}>
              {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={stepForward}>
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Time Selection */}
          <div className="flex items-center gap-2 border-r border-border pr-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="bg-background border border-border rounded px-2 py-1 text-sm"
            >
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {formatTime(time)}
                </option>
              ))}
            </select>
          </div>

          {/* Map Layer Selection */}
          <div className="flex items-center gap-2 border-r border-border pr-2">
            <Layers className="w-4 h-4 text-muted-foreground" />
            <select
              value={mapLayer}
              onChange={(e) => setMapLayer(e.target.value)}
              className="bg-background border border-border rounded px-2 py-1 text-sm"
            >
              {mapLayers.map((layer) => (
                <option key={layer.id} value={layer.id}>
                  {layer.name}
                </option>
              ))}
            </select>
          </div>

          {/* Visibility Toggles */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDayNightTerminator(!showDayNightTerminator)}
              className={showDayNightTerminator ? "bg-primary/10" : ""}
            >
              {showDayNightTerminator ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span className="ml-1 text-xs">Terminator</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSunDial(!showSunDial)}
              className={showSunDial ? "bg-primary/10" : ""}
            >
              {showSunDial ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span className="ml-1 text-xs">Sun Dial</span>
            </Button>
          </div>
        </div>

        {/* Map Container */}
        <div className={`relative ${isFullscreen ? "h-[calc(100vh-200px)]" : "h-96"} rounded-lg overflow-hidden border border-border`}>
          <MapContainer
            key={mapKey}
            center={[location.lat, location.lng]}
            zoom={13}
            className="w-full h-full"
            onLoad={() => setMapLoading(false)}
            onError={handleMapError}
          >
            <TileLayer
              url={mapLayers.find((l) => l.id === mapLayer)?.url || mapLayers[0].url}
              attribution={mapLayers.find((l) => l.id === mapLayer)?.attribution || mapLayers[0].attribution}
            />

            {/* Location Marker */}
            <Marker position={[location.lat, location.lng]}>
              <Popup>
                <div className="text-center">
                  <strong>{location.name}</strong>
                  <br />
                  Lat: {location.lat.toFixed(4)}
                  <br />
                  Lng: {location.lng.toFixed(4)}
                </div>
              </Popup>
            </Marker>

            {/* Sun Path */}
            {sunPath.length > 0 && (
              <Polyline
                positions={sunPath.map((point) => [point.lat, point.lng])}
                color="#fbbf24"
                weight={3}
                opacity={0.7}
                dashArray="5, 5"
              />
            )}

            {/* Day/Night Terminator */}
            {showDayNightTerminator && dayNightTerminator.length > 0 && (
              <Polyline
                positions={dayNightTerminator}
                color="#1f2937"
                weight={2}
                opacity={0.5}
                dashArray="10, 5"
              />
            )}

            {/* Sun Position Indicator */}
            {sunPosition.altitude > 0 && (
              <Circle
                center={[sunPositionOnMap.lat, sunPositionOnMap.lng]}
                radius={100}
                fillColor="#fbbf24"
                fillOpacity={0.3}
                color="#f59e0b"
                weight={2}
              >
                <Popup>
                  <div className="text-center">
                    <strong>Sun Position</strong>
                    <br />
                    Azimuth: {sunPosition.azimuth.toFixed(1)}°
                    <br />
                    Altitude: {sunPosition.altitude.toFixed(1)}°
                    <br />
                    Time: {formatTime(selectedTime)}
                  </div>
                </Popup>
              </Circle>
            )}
          </MapContainer>

          {/* Map Overlay Controls */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <Button variant="secondary" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="secondary" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
          </div>

          {/* Sun Dial Overlay */}
          {showSunDial && sunPosition.altitude > 0 && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="relative w-32 h-32">
                {/* Sun dial background */}
                <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-full border-2 border-yellow-400/50"></div>
                
                {/* Hour markers */}
                {Array.from({ length: 12 }, (_, i) => {
                  const angle = (i * 30) - 90 // Start from top (12 o'clock)
                  const radian = (angle * Math.PI) / 180
                  const x = 50 + 40 * Math.cos(radian)
                  const y = 50 + 40 * Math.sin(radian)
                  return (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-yellow-600 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${x}%`, top: `${y}%` }}
                    />
                  )
                })}
                
                {/* Sun direction indicator */}
                <div
                  className="absolute top-1/2 left-1/2 w-12 h-0.5 bg-yellow-500 transform -translate-y-1/2 origin-left"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${sunPosition.azimuth - 90}deg)`,
                  }}
                >
                  <div className="absolute right-0 top-1/2 w-3 h-3 bg-yellow-500 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
                </div>
                
                {/* Center dot */}
                <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-yellow-600 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-10"></div>
              </div>
            </div>
          )}

          {/* Compass */}
          <div className="absolute top-4 right-4 w-20 h-20 bg-white/95 backdrop-blur-sm rounded-full border-2 border-border shadow-xl">
            <div className="relative w-full h-full">
              <div className="absolute top-1 left-1/2 transform -translate-x-1/2 text-sm font-bold text-red-600">N</div>
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-sm font-bold text-blue-600">
                S
              </div>
              <div className="absolute left-1 top-1/2 transform -translate-y-1/2 text-sm font-bold text-gray-600">
                W
              </div>
              <div className="absolute right-1 top-1/2 transform -translate-y-1/2 text-sm font-bold text-gray-600">
                E
              </div>
              <div className="absolute top-1/2 left-1/2 w-px h-8 bg-gray-400 transform -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute top-1/2 left-1/2 w-8 h-px bg-gray-400 transform -translate-x-1/2 -translate-y-1/2" />

              {/* Sun direction indicator - Removed per user request */}

              {/* Center dot */}
              <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-gray-700 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-10" />
            </div>
          </div>

          {/* Map Layer Indicator */}
          <div className="absolute bottom-4 left-4 bg-black/60 text-white text-xs px-2 py-1 rounded">
            {mapLayers.find((l) => l.id === mapLayer)?.name}
          </div>
        </div>

        {/* Sun Path Timeline */}
        <div className="bg-gradient-to-r from-blue-50 to-yellow-50 rounded-lg p-4 border border-border">
          <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
            <Sun className="w-4 h-4" />
            Sun Path Timeline - {formatTime(selectedTime)}
          </h4>
          <div className="relative h-20 bg-white rounded-lg border border-border overflow-hidden">
            {/* Timeline background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-blue-500 to-yellow-300 opacity-20"></div>

            {/* Hour markers */}
            <div className="absolute inset-0 flex justify-between items-end px-2">
              {timeOptions
                .filter((_, i) => i % 3 === 0)
                .map((time, index) => (
                  <div key={time} className="flex flex-col items-center">
                    <div className="w-px h-4 bg-gray-400"></div>
                    <span className="text-xs text-muted-foreground mt-1">{formatTime(time)}</span>
                  </div>
                ))}
            </div>

            {/* Sun path line */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-12 relative">
                {sunPath.map((point, index) => {
                  const timeIndex = timeOptions.indexOf(point.time)
                  const progress = timeIndex / (timeOptions.length - 1)
                  const left = progress * 100
                  const altitude = point.altitude / 90 // Normalize to 0-1
                  const top = 50 - altitude * 40 // Center vertically, scale by altitude

                  return (
                    <div
                      key={index}
                      className={`absolute w-2 h-2 rounded-full transform -translate-x-1/2 -translate-y-1/2 ${
                        point.time === selectedTime ? "bg-yellow-500 scale-150" : "bg-yellow-400"
                      }`}
                      style={{
                        left: `${left}%`,
                        top: `${top}%`,
                        boxShadow:
                          point.time === selectedTime
                            ? "0 0 8px rgba(251, 191, 36, 0.8)"
                            : "0 0 4px rgba(251, 191, 36, 0.4)",
                      }}
                      title={`${point.time} - Alt: ${point.altitude.toFixed(1)}°`}
                    />
                  )
                })}

                {/* Current time indicator */}
                <div
                  className="absolute w-0.5 h-full bg-red-500 transform -translate-x-1/2"
                  style={{
                    left: `${(timeOptions.indexOf(selectedTime) / (timeOptions.length - 1)) * 100}%`,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Horizon line */}
            <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-400 border-dashed"></div>

            {/* Labels */}
            <div className="absolute left-2 top-2 text-xs text-blue-600 font-medium">Night</div>
            <div className="absolute right-2 top-2 text-xs text-yellow-600 font-medium">Day</div>
            <div className="absolute left-2 bottom-2 text-xs text-gray-500">Horizon</div>
          </div>
        </div>

        {/* Sun Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="font-medium text-muted-foreground mb-1 flex items-center gap-1">
              <Compass className="w-3 h-3" />
              Sun Azimuth
            </div>
            <div className="text-lg font-semibold text-primary">{sunPosition.azimuth.toFixed(1)}°</div>
            <div className="text-xs text-muted-foreground">
              {sunPosition.azimuth >= 0 && sunPosition.azimuth < 90
                ? "NE"
                : sunPosition.azimuth >= 90 && sunPosition.azimuth < 180
                  ? "SE"
                  : sunPosition.azimuth >= 180 && sunPosition.azimuth < 270
                    ? "SW"
                    : "NW"}
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3">
            <div className="font-medium text-muted-foreground mb-1 flex items-center gap-1">
              <Sun className="w-3 h-3" />
              Sun Altitude
            </div>
            <div className="text-lg font-semibold text-primary">{sunPosition.altitude.toFixed(1)}°</div>
            <div className="text-xs text-muted-foreground">{getSunIntensity(sunPosition.altitude)}</div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3">
            <div className="font-medium text-muted-foreground mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Shadow Length
            </div>
            <div className="text-lg font-semibold text-primary">
              {sunPosition.altitude > 0 ? (1 / Math.tan((sunPosition.altitude * Math.PI) / 180)).toFixed(1) : "∞"}x
            </div>
            <div className="text-xs text-muted-foreground">{getShadowLength(sunPosition.altitude)}</div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3">
            <div className="font-medium text-muted-foreground mb-1 flex items-center gap-1">
              <Navigation className="w-3 h-3" />
              Golden Hour
            </div>
            <div className="text-lg font-semibold text-primary">
              {sunPosition.altitude > 0 && sunPosition.altitude < 30 ? "YES" : "NO"}
            </div>
            <div className="text-xs text-muted-foreground">
              {sunPosition.altitude > 0 && sunPosition.altitude < 30 ? "Perfect lighting" : "Wait for golden hour"}
            </div>
          </div>
        </div>

        {/* Photography Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
            <Sun className="w-4 h-4" />
            Photography Tips for {formatTime(selectedTime)}
          </h4>
          <div className="text-sm text-blue-800 space-y-1">
            {sunPosition.altitude <= 0 && <p>• Sun is below horizon - perfect for blue hour and night photography</p>}
            {sunPosition.altitude > 0 && sunPosition.altitude < 10 && (
              <p>• Golden hour! Soft, warm light perfect for portraits and landscapes</p>
            )}
            {sunPosition.altitude >= 10 && sunPosition.altitude < 30 && (
              <p>• Good directional light - excellent for texture and shadow play</p>
            )}
            {sunPosition.altitude >= 30 && sunPosition.altitude < 60 && (
              <p>• Bright light - use fill flash or seek shade for portraits</p>
            )}
            {sunPosition.altitude >= 60 && <p>• Harsh overhead light - ideal for architectural details</p>}
            <p>
              • Sun direction:{" "}
              {sunPosition.azimuth >= 0 && sunPosition.azimuth < 90
                ? "Northeast (good for east-facing subjects)"
                : sunPosition.azimuth >= 90 && sunPosition.azimuth < 180
                  ? "Southeast (excellent lighting)"
                  : sunPosition.azimuth >= 180 && sunPosition.azimuth < 270
                    ? "Southwest (warm afternoon light)"
                    : "Northwest (dramatic sidelighting)"}
            </p>
          </div>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Click and drag to pan the map, scroll to zoom in/out</p>
          <p>• Use layer buttons to switch between street, satellite, and terrain views</p>
          <p>• Yellow circle shows approximate sun position on the map</p>
          <p>• Adjust time selector to see sun position at different times</p>
          <p>• Compass shows actual sun direction for the selected time</p>
        </div>
      </CardContent>
    </Card>
  )
}