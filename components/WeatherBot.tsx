'use client'

import { useState, useEffect } from 'react'
import { Cloud, Droplets, RefreshCw, Sun, Thermometer, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface WeatherData {
  temperature: number
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

export default function WeatherBot() {
  const [weatherData, setWeatherData] = useState<CityWeather[]>(cities)
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  const fetchWeatherData = async () => {
    setLoading(true)
    try {
      const updatedWeatherData = await Promise.all(
        weatherData.map(async (city) => {
          const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&hourly=temperature_2m`)
          const data = await response.json()
          const currentHour = new Date().getHours()
          return {
            ...city,
            data: {
              temperature: data.hourly.temperature_2m[currentHour],
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
          <CardTitle className="text-3xl font-bold text-center text-blue-300">FutureWeather</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex justify-center items-center mb-6 text-2xl font-semibold text-blue-300">
            <Clock className="w-6 h-6 mr-2" />
            {currentTime.toLocaleTimeString()}
          </div>
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
                        <Thermometer className="w-6 h-6 text-red-400" />
                        <span className="text-3xl font-bold">{city.data.temperature}°C</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <Sun className="w-5 h-5 text-yellow-400" />
                        <span className="text-sm text-gray-300">
                          Updated: {new Date(city.data.time).toLocaleTimeString()}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-gray-300">No data available</div>
                  )}
                </div>
              ))}
            </div>
          )}
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

