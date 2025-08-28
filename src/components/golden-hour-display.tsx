'use client'

import React, { memo } from 'react'
import { Sun, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ShareButton } from '@/components/ui/share-button'
import { LocationDisplayUtils } from '@/lib/location-utils'
import type { Location, WeatherData, PhotographyConditions } from '@/types'

interface GoldenHourDisplayProps {
  nextGoldenHour: string | null
  nextGoldenHourTime: string
  nextGoldenHourEndTime?: string
  nextGoldenHourType: 'morning' | 'evening'
  nextGoldenHourIsStart: boolean
  autoLocation: Location | null
  selectedDate?: string
  weatherData?: WeatherData | null
  weatherLoading?: boolean
  photographyConditions?: PhotographyConditions | null
}

export const GoldenHourDisplay = memo<GoldenHourDisplayProps>(function GoldenHourDisplay({
  nextGoldenHour,
  nextGoldenHourTime,
  nextGoldenHourEndTime,
  nextGoldenHourType,
  nextGoldenHourIsStart,
  autoLocation,
  selectedDate,
  weatherData,
  weatherLoading,
  photographyConditions
}) {
  // Helper function to get contextual message
  const getContextualMessage = () => {
    const context = getDateContext()
    
    switch (context) {
      case 'past':
        return 'Golden Hour'
      case 'future':
        return 'Golden Hour'
      case 'today':
      default:
        if (nextGoldenHourIsStart) {
          return 'Golden Hour Active'
        }
        return 'Next Golden Hour'
    }
  }
  
  // Helper function to determine date context
  const getDateContext = (): 'past' | 'future' | 'today' => {
    if (!selectedDate) return 'today'
    
    const selected = new Date(selectedDate)
    const today = new Date()
    
    // Reset time to compare dates only
    selected.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)
    
    if (selected < today) return 'past'
    if (selected > today) return 'future'
    return 'today'
  }
  
  // Helper function to get time display text
  const getTimeDisplayText = () => {
    const context = getDateContext()
    
    switch (context) {
      case 'past':
        return `${nextGoldenHourType === 'morning' ? 'Morning' : 'Evening'} golden hour was`
      case 'future':
        return `${nextGoldenHourType === 'morning' ? 'Morning' : 'Evening'} golden hour will be`
      case 'today':
      default:
        if (nextGoldenHourIsStart) {
          return 'Currently in golden hour'
        }
        return `${nextGoldenHourType === 'morning' ? 'Morning' : 'Evening'} golden hour`
    }
  }
  if (!nextGoldenHour) return null

  return (
    <div className="text-center mb-8">
      <div className="relative inline-flex flex-col items-center">
        <div className="relative z-10 inline-flex flex-col items-center gap-4 rounded-3xl px-4 sm:px-8 md:px-12 py-6 sm:py-8 text-foreground w-full max-w-2xl mx-auto shadow-2xl border border-amber-200/40 overflow-hidden">
          {/* Mountain Sunset Background */}
          <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {/* Sky gradient */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-sky-700 via-orange-300 to-red-500"></div>
            
            {/* Sun */}
            <div className="absolute top-8 right-12 w-16 h-16 bg-yellow-300 rounded-full shadow-lg shadow-yellow-400/50"></div>
            
            {/* Mountain layers */}
            <div className="absolute bottom-0 left-0 w-full h-2/3">
              {/* Back mountains */}
              <div className="absolute bottom-0 left-0 w-full h-full bg-gray-900 opacity-80" 
                   style={{ 
                     clipPath: 'polygon(0% 100%, 10% 60%, 25% 40%, 40% 65%, 55% 35%, 70% 55%, 85% 30%, 100% 50%, 100% 100%)' 
                   }}>
              </div>
              
              {/* Middle mountains */}
              <div className="absolute bottom-0 left-0 w-full h-5/6 bg-gray-800 opacity-85" 
                   style={{ 
                     clipPath: 'polygon(0% 100%, 15% 50%, 30% 70%, 45% 45%, 60% 65%, 75% 40%, 90% 60%, 100% 35%, 100% 100%)' 
                   }}>
              </div>
              
              {/* Front mountains */}
              <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gray-900 opacity-95" 
                   style={{ 
                     clipPath: 'polygon(0% 100%, 5% 70%, 20% 45%, 35% 60%, 50% 30%, 65% 50%, 80% 25%, 95% 40%, 100% 20%, 100% 100%)' 
                   }}>
              </div>
            </div>
            
            {/* Dark gradient overlay for text readability - improved contrast */}
            <div className="absolute bottom-0 left-0 w-full h-3/4 bg-gradient-to-t from-black/90 via-black/60 to-transparent"></div>
          </div>

          {/* Card content with improved contrast */}
          <div className="relative z-20">
            <div className="relative">
              <Sun className="w-12 h-12 text-yellow-300 animate-pulse" aria-hidden="true" />
              {/* Subtle glow effect */}
              <div className="absolute inset-0 w-12 h-12 bg-yellow-400/50 rounded-full blur-lg animate-pulse"></div>
            </div>
            <div className="text-sm font-medium text-yellow-100 tracking-wider uppercase drop-shadow-lg">{getContextualMessage().toUpperCase()}</div>

            <div className="flex flex-col items-center gap-1">
              <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-center leading-none tracking-tight text-white drop-shadow-xl">
                {nextGoldenHourTime}
              </div>
              {nextGoldenHourEndTime && (
                <div className="text-base sm:text-lg md:text-xl font-medium text-center text-yellow-100 drop-shadow-lg">
                  to {nextGoldenHourEndTime}
                </div>
              )}
            </div>

            <div className="text-lg sm:text-xl md:text-2xl font-semibold text-center text-yellow-100 drop-shadow-lg capitalize">{getTimeDisplayText()}</div>

            <div className="text-base sm:text-lg md:text-xl font-medium text-center text-yellow-50 drop-shadow-lg">
              {(() => {
                const context = getDateContext()
                
                if (context === 'past') {
                  return (
                    <div className="text-base sm:text-lg md:text-xl font-medium text-yellow-100 drop-shadow-lg">
                      {nextGoldenHourTime} - {nextGoldenHourEndTime}
                    </div>
                  )
                }
                
                if (context === 'future') {
                  const futureDate = selectedDate ? new Date(selectedDate) : new Date()
                  const today = new Date()
                  const diffTime = Math.abs(futureDate.getTime() - today.getTime())
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                  
                  return (
                    <div className="flex flex-col items-center gap-1">
                      <div className="text-base sm:text-lg md:text-xl font-medium text-yellow-100 drop-shadow-lg">
                        In {diffDays} {diffDays === 1 ? 'day' : 'days'}
                      </div>
                      <div className="text-sm text-yellow-200 drop-shadow-lg">
                        {nextGoldenHourTime} - {nextGoldenHourEndTime}
                      </div>
                    </div>
                  )
                }
                
                // Today's logic
                if (nextGoldenHour.includes("starts tomorrow")) {
                  return nextGoldenHour
                }
                
                return (
                  <div className="flex flex-col items-center gap-1">
                    <div className="text-base sm:text-lg md:text-xl font-medium text-yellow-100 drop-shadow-lg">
                      {nextGoldenHourIsStart ? "Starts in" : "Ends in"}
                    </div>
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-xl animate-pulse">
                      {nextGoldenHour?.replace(/^(starts in|ends in) /, "") || ""}
                    </div>
                  </div>
                )
              })()}
            </div>

            {autoLocation && (
              <div className="flex flex-col items-center gap-2 text-sm text-yellow-100 mt-2 drop-shadow-lg">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-yellow-300" aria-hidden="true" />
                  <span className="font-medium text-white">
                    {LocationDisplayUtils.getShortDisplayName(autoLocation)}
                  </span>
                </div>
                
                {/* Share Button */}
                <div className="mt-3">
                  <ShareButton 
                    title={`Golden Hour Times in ${LocationDisplayUtils.getCityName(autoLocation)}`}
                    description={`Perfect golden hour photography times for ${LocationDisplayUtils.getCityName(autoLocation)}. ${getTimeDisplayText()} ${nextGoldenHourTime}${nextGoldenHourEndTime ? ` to ${nextGoldenHourEndTime}` : ''}.`}
                    variant="outline"
                    size="sm"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
                  />
                </div>
                
                {weatherLoading ? (
                  <div className="flex items-center gap-2 text-xs text-yellow-100" role="status" aria-live="polite">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    <span>Loading weather data...</span>
                  </div>
                ) : weatherData ? (
                  <div className="flex flex-col items-center gap-1 text-xs text-yellow-100">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-medium">{weatherData.temp}°C</span>
                      <span className="text-white capitalize">{weatherData.description}</span>
                      <span className="text-white">Clouds: {weatherData.clouds}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white">Visibility: {weatherData.visibility}km</span>
                      <span className="text-white">Humidity: {weatherData.humidity}%</span>
                      <span className="text-white">Wind: {weatherData.windSpeed}m/s</span>
                    </div>
                    {photographyConditions && (
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs bg-green-700/30 text-green-50 border-green-500/40">
                          Golden Hour: {photographyConditions.goldenHourQuality}
                        </Badge>
                        <Badge variant="secondary" className="text-xs bg-blue-700/30 text-blue-50 border-blue-500/40">
                          Blue Hour: {photographyConditions.blueHourQuality}
                        </Badge>
                        <Badge variant="secondary" className="text-xs bg-purple-700/30 text-purple-50 border-purple-500/40">
                          Score: {photographyConditions.overallScore}/100
                        </Badge>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-yellow-200">
                    Weather data unavailable
                  </div>
                )}
                
                {autoLocation.accuracy && (
                  <div className="text-xs text-yellow-200">
                    {autoLocation.accuracy}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})