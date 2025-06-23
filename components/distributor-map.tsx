"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Phone, Mail, Globe, Navigation } from 'lucide-react'

interface Distributor {
  id: string
  businessName: string
  contactName: string
  phoneNumber: string
  emailAddress: string
  street: string
  city: string
  state: string
  zipCode: string
  website?: string
  businessType: string
  territory: string
  latitude: number
  longitude: number
  distance?: number
}

interface DistributorMapProps {
  className?: string
}

export default function DistributorMap({ className }: DistributorMapProps) {
  const [distributors, setDistributors] = useState<Distributor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchZip, setSearchZip] = useState('')
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null)
  const [searchRadius, setSearchRadius] = useState(50)

  useEffect(() => {
    loadAllDistributors()
  }, [])

  const loadAllDistributors = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/distributors')
      const data = await response.json()
      
      if (data.success) {
        setDistributors(data.distributors)
      }
    } catch (error) {
      console.error('Error loading distributors:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchByZipCode = async () => {
    if (!searchZip.trim()) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/distributors?zip=${searchZip}&radius=${searchRadius}`)
      const data = await response.json()
      
      if (data.success) {
        setDistributors(data.distributors)
      } else {
        alert(data.error || 'Failed to search by ZIP code')
      }
    } catch (error) {
      console.error('Error searching by ZIP code:', error)
      alert('Failed to search by ZIP code')
    } finally {
      setLoading(false)
    }
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser')
      return
    }

    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })
        
        try {
          const response = await fetch(`/api/distributors?lat=${latitude}&lng=${longitude}&radius=${searchRadius}`)
          const data = await response.json()
          
          if (data.success) {
            setDistributors(data.distributors)
          }
        } catch (error) {
          console.error('Error searching by location:', error)
        } finally {
          setLoading(false)
        }
      },
      (error) => {
        console.error('Error getting location:', error)
        alert('Unable to get your location. Please try searching by ZIP code.')
        setLoading(false)
      }
    )
  }

  const formatAddress = (distributor: Distributor) => {
    return `${distributor.street}, ${distributor.city}, ${distributor.state} ${distributor.zipCode}`
  }

  const getDirectionsUrl = (distributor: Distributor) => {
    const address = encodeURIComponent(formatAddress(distributor))
    return `https://www.google.com/maps/dir/?api=1&destination=${address}`
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Find Distributors Near You</CardTitle>
          <CardDescription>
            Search for Force Dowels distributors by ZIP code or use your current location
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Enter ZIP code (e.g., 85296)"
                value={searchZip}
                onChange={(e) => setSearchZip(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchByZipCode()}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={searchByZipCode} disabled={loading}>
                Search ZIP
              </Button>
              <Button 
                onClick={useCurrentLocation} 
                disabled={loading}
                variant="outline"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Use Location
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Search Radius:</label>
            <select 
              value={searchRadius} 
              onChange={(e) => setSearchRadius(Number(e.target.value))}
              className="border rounded px-2 py-1"
            >
              <option value={25}>25 miles</option>
              <option value={50}>50 miles</option>
              <option value={100}>100 miles</option>
              <option value={200}>200 miles</option>
            </select>
            <Button 
              onClick={loadAllDistributors} 
              variant="ghost" 
              size="sm"
              disabled={loading}
            >
              Show All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p>Loading distributors...</p>
            </div>
          </CardContent>
        </Card>
      ) : distributors.length === 0 ? (
        <Card>
          <CardContent className="text-center p-8">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Distributors Found</h3>
            <p className="text-gray-600">
              No distributors found in your search area. Try expanding your search radius or contact us directly.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {distributors.map((distributor) => (
            <Card key={distributor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{distributor.businessName}</CardTitle>
                <CardDescription>
                  {distributor.businessType} • {distributor.contactName}
                  {distributor.distance && (
                    <span className="block text-blue-600 font-medium">
                      {distributor.distance} miles away
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p>{distributor.street}</p>
                    <p>{distributor.city}, {distributor.state} {distributor.zipCode}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <a 
                    href={`tel:${distributor.phoneNumber}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {distributor.phoneNumber}
                  </a>
                </div>
                
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <a 
                    href={`mailto:${distributor.emailAddress}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {distributor.emailAddress}
                  </a>
                </div>
                
                {distributor.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <a 
                      href={distributor.website.startsWith('http') ? distributor.website : `https://${distributor.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
                
                <div className="pt-2">
                  <p className="text-xs text-gray-600 mb-2">
                    <strong>Territory:</strong> {distributor.territory}
                  </p>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => window.open(getDirectionsUrl(distributor), '_blank')}
                  >
                    Get Directions
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
