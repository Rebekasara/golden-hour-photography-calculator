'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  MousePointer, 
  Share2, 
  MapPin, 
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface DashboardData {
  summary: {
    totalUrls: number
    totalViews: number
    avgSeoScore: number
    topLocation: string
  }
  topPerforming: Array<{
    url: string
    views: number
    seoScore: number
    conversionRate: number
  }>
  underperforming: Array<{
    url: string
    views: number
    seoScore: number
    conversionRate: number
  }>
  locationPerformance: Array<{
    location: string
    totalViews: number
    avgSeoScore: number
    urlCount: number
  }>
  trends: {
    viewsGrowth: number
    seoImprovement: number
    conversionTrend: number
  }
}

interface URLMetrics {
  url: string
  views: number
  uniqueVisitors: number
  bounceRate: number
  avgTimeOnPage: number
  seoScore: number
  keywords: string[]
  socialShares: number
  conversions: number
  conversionRate: number
  lastUpdated: string
}

interface LocationAnalytics {
  location: string
  totalViews: number
  uniqueVisitors: number
  avgSeoScore: number
  topKeywords: string[]
  urlCount: number
  avgConversionRate: number
  socialShares: number
  lastUpdated: string
}

export default function AnalyticsDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [urlMetrics, setUrlMetrics] = useState<URLMetrics[]>([])
  const [locationAnalytics, setLocationAnalytics] = useState<LocationAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedUrl, setSelectedUrl] = useState<string>('')
  const [selectedLocation, setSelectedLocation] = useState<string>('')

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/analytics?action=dashboard-data')
      const result = await response.json()
      
      if (result.success) {
        setDashboardData(result.data)
      } else {
        setError(result.error || 'Failed to fetch dashboard data')
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Dashboard data fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllMetrics = async () => {
    try {
      const response = await fetch('/api/analytics?action=all-metrics')
      const result = await response.json()
      
      if (result.success) {
        setUrlMetrics(result.metrics)
      }
    } catch (err) {
      console.error('Metrics fetch error:', err)
    }
  }

  const fetchLocationAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics?action=all-location-analytics')
      const result = await response.json()
      
      if (result.success) {
        setLocationAnalytics(result.analytics)
      }
    } catch (err) {
      console.error('Location analytics fetch error:', err)
    }
  }

  const fetchUrlDetails = async (url: string) => {
    try {
      const response = await fetch(`/api/analytics?action=metrics&url=${encodeURIComponent(url)}`)
      const result = await response.json()
      
      if (result.success) {
        // Update the specific URL in the metrics array
        setUrlMetrics(prev => 
          prev.map(metric => 
            metric.url === url ? { ...metric, ...result.metrics } : metric
          )
        )
      }
    } catch (err) {
      console.error('URL details fetch error:', err)
    }
  }

  const fetchLocationDetails = async (location: string) => {
    try {
      const response = await fetch(`/api/analytics?action=location-analytics&location=${encodeURIComponent(location)}`)
      const result = await response.json()
      
      if (result.success) {
        // Update the specific location in the analytics array
        setLocationAnalytics(prev => 
          prev.map(analytics => 
            analytics.location === location ? { ...analytics, ...result.analytics } : analytics
          )
        )
      }
    } catch (err) {
      console.error('Location details fetch error:', err)
    }
  }

  const downloadCSV = async () => {
    try {
      const response = await fetch('/api/analytics?action=all-metrics&format=csv')
      const csvData = await response.text()
      
      const blob = new Blob([csvData], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'url-analytics.csv'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('CSV download error:', err)
    }
  }

  const downloadJSON = async () => {
    try {
      const response = await fetch('/api/analytics?action=all-location-analytics&format=json-file')
      const jsonData = await response.text()
      
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'location-analytics.json'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('JSON download error:', err)
    }
  }

  useEffect(() => {
    fetchDashboardData()
    fetchAllMetrics()
    fetchLocationAnalytics()
  }, [])

  useEffect(() => {
    if (selectedUrl) {
      fetchUrlDetails(selectedUrl)
    }
  }, [selectedUrl])

  useEffect(() => {
    if (selectedLocation) {
      fetchLocationDetails(selectedLocation)
    }
  }, [selectedLocation])

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <BarChart3 className="h-4 w-4 text-gray-600" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading analytics data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <span className="ml-2 text-red-600">{error}</span>
        <Button onClick={fetchDashboardData} className="ml-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">URL Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and analyze performance of location-based URLs
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchDashboardData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={downloadCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={downloadJSON} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total URLs</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(dashboardData.summary.totalUrls)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(dashboardData.summary.totalViews)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {getTrendIcon(dashboardData.trends.viewsGrowth)}
                <span className="ml-1">{dashboardData.trends.viewsGrowth > 0 ? '+' : ''}{dashboardData.trends.viewsGrowth}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg SEO Score</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getScoreColor(dashboardData.summary.avgSeoScore)}`}>
                {dashboardData.summary.avgSeoScore}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                {getTrendIcon(dashboardData.trends.seoImprovement)}
                <span className="ml-1">{dashboardData.trends.seoImprovement > 0 ? '+' : ''}{dashboardData.trends.seoImprovement}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Location</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold truncate">{dashboardData.summary.topLocation}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="urls">URL Performance</TabsTrigger>
          <TabsTrigger value="locations">Location Analytics</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {dashboardData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Performing URLs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                    Top Performing URLs
                  </CardTitle>
                  <CardDescription>URLs with highest engagement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardData.topPerforming?.map((url, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm truncate">{url.url}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center">
                              <Eye className="h-3 w-3 mr-1" />
                              {formatNumber(url.views)}
                            </span>
                            <span className="flex items-center">
                              <MousePointer className="h-3 w-3 mr-1" />
                              {url.conversionRate.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <Badge variant={url.seoScore >= 80 ? 'default' : url.seoScore >= 60 ? 'secondary' : 'destructive'}>
                          {url.seoScore}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Underperforming URLs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingDown className="h-5 w-5 mr-2 text-red-600" />
                    Underperforming URLs
                  </CardTitle>
                  <CardDescription>URLs that need optimization</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardData.underperforming?.map((url, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm truncate">{url.url}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center">
                              <Eye className="h-3 w-3 mr-1" />
                              {formatNumber(url.views)}
                            </span>
                            <span className="flex items-center">
                              <MousePointer className="h-3 w-3 mr-1" />
                              {url.conversionRate.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <Badge variant={url.seoScore >= 80 ? 'default' : url.seoScore >= 60 ? 'secondary' : 'destructive'}>
                          {url.seoScore}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="urls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>URL Performance Metrics</CardTitle>
              <CardDescription>Detailed analytics for all location URLs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {urlMetrics.map((metric, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">{metric.url}</h3>
                      <Badge variant={metric.seoScore >= 80 ? 'default' : metric.seoScore >= 60 ? 'secondary' : 'destructive'}>
                        SEO: {metric.seoScore}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Views</p>
                        <p className="font-medium">{formatNumber(metric.views)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Unique Visitors</p>
                        <p className="font-medium">{formatNumber(metric.uniqueVisitors)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Bounce Rate</p>
                        <p className="font-medium">{metric.bounceRate.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Conversion Rate</p>
                        <p className="font-medium">{metric.conversionRate.toFixed(1)}%</p>
                      </div>
                    </div>
                    
                    <Separator className="my-3" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Share2 className="h-3 w-3 mr-1" />
                          {metric.socialShares} shares
                        </span>
                        <span>Keywords: {metric.keywords?.slice(0, 3).join(', ') || 'None'}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedUrl(metric.url)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Location Performance</CardTitle>
              <CardDescription>Analytics grouped by location</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {locationAnalytics.map((location, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {location.location}
                      </h3>
                      <Badge variant={location.avgSeoScore >= 80 ? 'default' : location.avgSeoScore >= 60 ? 'secondary' : 'destructive'}>
                        Avg SEO: {location.avgSeoScore}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Views</p>
                        <p className="font-medium">{formatNumber(location.totalViews)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Unique Visitors</p>
                        <p className="font-medium">{formatNumber(location.uniqueVisitors)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">URL Count</p>
                        <p className="font-medium">{location.urlCount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg Conversion</p>
                        <p className="font-medium">{location.avgConversionRate.toFixed(1)}%</p>
                      </div>
                    </div>
                    
                    <Separator className="my-3" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Share2 className="h-3 w-3 mr-1" />
                          {location.socialShares} shares
                        </span>
                        <span>Top keywords: {location.topKeywords?.slice(0, 3).join(', ') || 'None'}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedLocation(location.location)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {dashboardData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                  <CardDescription>Key metrics over time</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Views Growth</span>
                    <div className="flex items-center">
                      {getTrendIcon(dashboardData.trends.viewsGrowth)}
                      <span className={`ml-2 font-medium ${
                        dashboardData.trends.viewsGrowth > 0 ? 'text-green-600' : 
                        dashboardData.trends.viewsGrowth < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {dashboardData.trends.viewsGrowth > 0 ? '+' : ''}{dashboardData.trends.viewsGrowth}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>SEO Improvement</span>
                    <div className="flex items-center">
                      {getTrendIcon(dashboardData.trends.seoImprovement)}
                      <span className={`ml-2 font-medium ${
                        dashboardData.trends.seoImprovement > 0 ? 'text-green-600' : 
                        dashboardData.trends.seoImprovement < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {dashboardData.trends.seoImprovement > 0 ? '+' : ''}{dashboardData.trends.seoImprovement}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Conversion Trend</span>
                    <div className="flex items-center">
                      {getTrendIcon(dashboardData.trends.conversionTrend)}
                      <span className={`ml-2 font-medium ${
                        dashboardData.trends.conversionTrend > 0 ? 'text-green-600' : 
                        dashboardData.trends.conversionTrend < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {dashboardData.trends.conversionTrend > 0 ? '+' : ''}{dashboardData.trends.conversionTrend}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Locations by Performance</CardTitle>
                  <CardDescription>Best performing locations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardData?.locationPerformance?.slice(0, 5).map((location, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                            index === 0 ? 'bg-yellow-100 text-yellow-800' :
                            index === 1 ? 'bg-gray-100 text-gray-800' :
                            index === 2 ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {index + 1}
                          </div>
                          <span className="ml-3 font-medium">{location.location}</span>
                        </div>
                        <div className="text-right text-sm">
                          <div className="font-medium">{formatNumber(location.totalViews)} views</div>
                          <div className="text-muted-foreground">{location.urlCount} URLs</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}