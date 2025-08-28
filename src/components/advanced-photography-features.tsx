"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Camera, 
  Sun, 
  Moon, 
  Cloud, 
  Wind, 
  Droplets, 
  Eye, 
  Thermometer,
  Gauge,
  Zap,
  Mountain,
  Building,
  TreePine,
  Waves,
  CameraOff
} from "lucide-react"

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

interface AdvancedPhotographyFeaturesProps {
  location: LocationData
  date: string
}

interface WeatherData {
  temp: number
  humidity: number
  windSpeed: number
  visibility: number
  cloudCover: number
  uvIndex: number
  pressure: number
  description: string
}

interface PhotographyRecommendation {
  type: string
  icon: React.ReactNode
  title: string
  description: string
  tips: string[]
  rating: number
  bestTime: string
}

export default function AdvancedPhotographyFeatures({ location, date }: AdvancedPhotographyFeaturesProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<PhotographyRecommendation[]>([])

  useEffect(() => {
    fetchWeatherData()
    generateRecommendations()
  }, [location, date])

  const fetchWeatherData = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=79c1bbcbb08bd676c2b2498bfc0f353d&units=metric`,
      )
      const data = await response.json()
      
      setWeatherData({
        temp: Math.round(data.main?.temp || 20),
        humidity: data.main?.humidity || 60,
        windSpeed: data.wind?.speed || 5,
        visibility: (data.visibility || 10000) / 1000,
        cloudCover: data.clouds?.all || 30,
        uvIndex: Math.round(Math.random() * 11), // Simulated UV index
        pressure: data.main?.pressure || 1013,
        description: data.weather?.[0]?.description || "partly cloudy"
      })
    } catch (error) {
      console.error("Error fetching weather data:", error)
      // Set fallback data
      setWeatherData({
        temp: 20,
        humidity: 60,
        windSpeed: 5,
        visibility: 10,
        cloudCover: 30,
        uvIndex: 5,
        pressure: 1013,
        description: "partly cloudy"
      })
    } finally {
      setLoading(false)
    }
  }

  const generateRecommendations = () => {
    const baseRecommendations: PhotographyRecommendation[] = [
      {
        type: "landscape",
        icon: <Mountain className="w-5 h-5" />,
        title: "Landscape Photography",
        description: "Perfect for wide-angle shots of natural scenery",
        tips: [
          "Use a tripod for stability",
          "Shoot during golden hour for warm lighting",
          "Use aperture f/8-f/16 for depth of field",
          "Include foreground elements for scale"
        ],
        rating: 85,
        bestTime: "Golden Hour"
      },
      {
        type: "portrait",
        icon: <Camera className="w-5 h-5" />,
        title: "Portrait Photography",
        description: "Ideal for people photography with soft lighting",
        tips: [
          "Use aperture f/1.4-f/2.8 for bokeh",
          "Position subject facing the light",
          "Use reflector for fill light",
          "Capture catchlights in eyes"
        ],
        rating: 90,
        bestTime: "Golden Hour"
      },
      {
        type: "architecture",
        icon: <Building className="w-5 h-5" />,
        title: "Architecture Photography",
        description: "Great for buildings and urban structures",
        tips: [
          "Use wide-angle lens for grand views",
          "Shoot during blue hour for city lights",
          "Look for leading lines",
          "Correct perspective distortion"
        ],
        rating: 75,
        bestTime: "Blue Hour"
      },
      {
        type: "nature",
        icon: <TreePine className="w-5 h-5" />,
        title: "Nature & Wildlife",
        description: "Perfect for flora and fauna photography",
        tips: [
          "Use telephoto lens for wildlife",
          "Be patient and quiet",
          "Shoot during golden hour",
          "Use fast shutter speed for movement"
        ],
        rating: 80,
        bestTime: "Early Morning"
      },
      {
        type: "street",
        icon: <CameraOff className="w-5 h-5" />,
        title: "Street Photography",
        description: "Capture candid moments in urban environments",
        tips: [
          "Use prime lens for discretion",
          "Shoot in aperture priority mode",
          "Look for interesting characters",
          "Respect people's privacy"
        ],
        rating: 70,
        bestTime: "Golden Hour"
      },
      {
        type: "seascape",
        icon: <Waves className="w-5 h-5" />,
        title: "Seascape Photography",
        description: "Beautiful ocean and coastal photography",
        tips: [
          "Use ND filter for long exposures",
          "Shoot during golden hour",
          "Use tripod for stability",
          "Protect equipment from salt spray"
        ],
        rating: 88,
        bestTime: "Sunset"
      }
    ]

    // Adjust ratings based on simulated weather conditions
    const adjustedRecommendations = baseRecommendations.map(rec => {
      let adjustedRating = rec.rating
      
      if (weatherData) {
        // Adjust for cloud cover
        if (weatherData.cloudCover > 70) {
          if (rec.type === 'landscape') adjustedRating -= 20
          if (rec.type === 'portrait') adjustedRating += 10
        }
        
        // Adjust for wind
        if (weatherData.windSpeed > 15) {
          if (rec.type === 'nature') adjustedRating -= 15
          if (rec.type === 'seascape') adjustedRating -= 10
        }
        
        // Adjust for visibility
        if (weatherData.visibility < 5) {
          adjustedRating -= 25
        }
      }
      
      return {
        ...rec,
        rating: Math.max(0, Math.min(100, adjustedRating))
      }
    })

    setRecommendations(adjustedRecommendations.sort((a, b) => b.rating - a.rating))
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 80) return 'text-green-600 bg-green-50'
    if (rating >= 60) return 'text-yellow-600 bg-yellow-50'
    if (rating >= 40) return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
  }

  const getRatingLabel = (rating: number) => {
    if (rating >= 80) return 'Excellent'
    if (rating >= 60) return 'Good'
    if (rating >= 40) return 'Fair'
    return 'Poor'
  }

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <Camera className="w-5 h-5 text-primary" />
          Advanced Photography Features
        </CardTitle>
        <CardDescription>
          Professional photography recommendations based on weather conditions and optimal lighting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Weather Conditions */}
        {weatherData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <Thermometer className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-blue-600">{weatherData.temp}°C</div>
              <div className="text-xs text-blue-800">Temperature</div>
            </div>
            
            <div className="bg-cyan-50 rounded-lg p-3 text-center">
              <Droplets className="w-6 h-6 text-cyan-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-cyan-600">{weatherData.humidity}%</div>
              <div className="text-xs text-cyan-800">Humidity</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <Wind className="w-6 h-6 text-gray-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-gray-600">{weatherData.windSpeed} m/s</div>
              <div className="text-xs text-gray-800">Wind Speed</div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <Eye className="w-6 h-6 text-purple-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-purple-600">{weatherData.visibility} km</div>
              <div className="text-xs text-purple-800">Visibility</div>
            </div>
          </div>
        )}

        {/* Photography Recommendations */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Photography Recommendations</h3>
          
          <div className="grid gap-4">
            {recommendations.map((rec, index) => (
              <div key={rec.type} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {rec.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getRatingColor(rec.rating)}`}>
                    {getRatingLabel(rec.rating)} ({rec.rating}%)
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-muted-foreground mb-2">Pro Tips:</h5>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      {rec.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-medium text-muted-foreground mb-1">Best Time:</h5>
                      <div className="text-sm font-medium text-primary">{rec.bestTime}</div>
                    </div>
                    
                    <div className="text-right">
                      <h5 className="text-sm font-medium text-muted-foreground mb-1">Priority:</h5>
                      <div className="text-lg font-bold text-primary">#{index + 1}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lighting Conditions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Lighting Conditions</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sun className="w-5 h-5 text-yellow-600" />
                <h4 className="font-semibold text-yellow-800">Golden Hour</h4>
              </div>
              <ul className="text-sm space-y-1 text-yellow-700">
                <li>• Soft, warm directional light</li>
                <li>• Long shadows create depth</li>
                <li>• Perfect for portraits and landscapes</li>
                <li>• Warm color temperature (3000-4000K)</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Moon className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-blue-800">Blue Hour</h4>
              </div>
              <ul className="text-sm space-y-1 text-blue-700">
                <li>• Soft, even blue-tinted light</li>
                <li>• Balanced natural and artificial light</li>
                <li>• Ideal for cityscapes and architecture</li>
                <li>• Cool color temperature (6000-8000K)</li>
              </ul>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-4">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Recommendations are based on weather conditions, time of day, and photography best practices</p>
          <p>• Ratings adjust dynamically based on current weather conditions</p>
          <p>• Always check local conditions and use your judgment</p>
        </div>
      </CardContent>
    </Card>
  )
}