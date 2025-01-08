'use client'

import { useState, useEffect } from 'react'
import { Cloud, Droplets, RefreshCw, Sun, Thermometer, Clock, Wind, Droplet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import WeatherChart from './WeatherChart'

interface WeatherData {
  temperature: number
  humidity: number
  windSpeed: number
  time: string
}

interface CityWeather {
  name: string
  lat: number
  lon: number
  data: WeatherData | null
}

const cities: CityWeather[] = [
  { name: 'Delhi', lat: 28.6139, lon: 77.2090, data: null },
  { name: 'Bangalore', lat: 12.9716, lon: 77.5946, data: null },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777, data: null },
  { name: 'Gulbarga', lat: 17.3297, lon: 76.8343, data: null },
]

export default function SaasWeatherBot() {
  const [weatherData, setWeatherData] = useState<CityWeather[]>(cities)
  const [loading, setLoading] = useState(true)
const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedCity, setSelectedCity] = useState(cities[0].name)

  const fetchWeatherData = async () => {
    setLoading(true)
    try {
      const updatedWeatherData = await Promise.all(
        weatherData.map(async (city) => {
          const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&hourly=temperature_2m,relativehumidity_2m,windspeed_10m&forecast_days=1`)
          const data = await response.json()
          const currentHour = new Date().getHours()
          return {
            ...city,
            data: {
              temperature: data.hourly.temperature_2m[currentHour],
              humidity: data.hourly.relativehumidity_2m[currentHour],
              windSpeed: data.hourly.windspeed_10m[currentHour],
              time: data.hourly.time[currentHour],
            },
          }
        })
      )
      setWeatherData(updatedWeatherData)
    } catch (error) {
      console.error('Error fetching weather data:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchWeatherData()
    const weatherInterval = setInterval(fetchWeatherData, 600000) // Refresh every 10 minutes

    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => {
      clearInterval(weatherInterval)
      clearInterval(timeInterval)
    }
  }, [])

  const getWeatherIcon = (temperature: number) => {
    if (temperature > 30) return <Sun className="w-8 h-8 text-yellow-400" />
    if (temperature > 20) return <Cloud className="w-8 h-8 text-gray-400" />
    return <Droplets className="w-8 h-8 text-blue-400" />
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-element left-10 top-10 w-20 h-20 bg-blue-500 rounded-full opacity-20"></div>
        <div className="floating-element right-20 top-40 w-32 h-32 bg-purple-500 rounded-full opacity-20"></div>
        <div className="floating-element left-1/4 bottom-20 w-24 h-24 bg-green-500 rounded-full opacity-20"></div>
        <div className="floating-element right-1/3 bottom-40 w-16 h-16 bg-yellow-500 rounded-full opacity-20"></div>
      </div>
      <Card className="w-full max-w-4xl mx-auto overflow-hidden backdrop-blur-lg bg-gray-800/50 border-none shadow-2xl">
        <CardHeader className="bg-gray-700/50">
          <CardTitle className="text-3xl font-bold text-center text-blue-300">SaaS Weather Bot</CardTitle>
          <div className="flex justify-center items-center mt-2 text-xl font-semibold text-blue-300">
            <Clock className="w-5 h-5 mr-2" />
            {currentTime.toLocaleTimeString()}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="current" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="current">Current Weather</TabsTrigger>
              <TabsTrigger value="forecast">Forecast</TabsTrigger>
            </TabsList>
            <TabsContent value="current">
              {loading ? (
                <div className="text-center text-blue-200">Loading weather data...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {weatherData.map((city) => (
                    <div key={city.name} className="space-y-4 bg-gray-700/30 p-4 rounded-lg backdrop-blur-sm">
                      <h2 className="text-xl font-semibold text-center text-blue-300">{city.name}</h2>
                      {city.data ? (
                        <>
                          <div className="flex items-center justify-center space-x-2">
                            {getWeatherIcon(city.data.temperature)}
                            <span className="text-3xl font-bold">{city.data.temperature}°C</span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-300">
                            <div className="flex items-center">
                              <Droplet className="w-4 h-4 mr-1" />
                              <span>{city.data.humidity}%</span>
                            </div>
                            <div className="flex items-center">
                              <Wind className="w-4 h-4 mr-1" />
                              <span>{city.data.windSpeed} km/h</span>
                            </div>
                          </div>
                          <div className="text-center text-xs text-gray-400">
                            Updated: {new Date(city.data.time).toLocaleTimeString()}
                          </div>
                        </>
                      ) : (
                        <div className="text-center text-gray-300">No data available</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="forecast">
              <div className="space-y-4">
                <Select onValueChange={setSelectedCity} defaultValue={selectedCity}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.name} value={city.name}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <WeatherChart city={weatherData.find(city => city.name === selectedCity)!} />
              </div>
            </TabsContent>
          </Tabs>
          <Button
            className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={fetchWeatherData}
            disabled={loading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Weather
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

