'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface WeatherChartProps {
  city: {
    name: string
    lat: number
    lon: number
  }
}

export default function WeatherChart({ city }: WeatherChartProps) {
  const [forecastData, setForecastData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchForecastData = async () => {
      setLoading(true)
      try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&hourly=temperature_2m,relativehumidity_2m,windspeed_10m&forecast_days=3`)
        const data = await response.json()
        const formattedData = data.hourly.time.map((time: string, index: number) => ({
          time: new Date(time).toLocaleString(),
          temperature: data.hourly.temperature_2m[index],
          humidity: data.hourly.relativehumidity_2m[index],
          windSpeed: data.hourly.windspeed_10m[index],
        }))
        setForecastData(formattedData)
      } catch (error) {
        console.error('Error fetching forecast data:', error)
      }
      setLoading(false)
    }

    fetchForecastData()
  }, [city])

  if (loading) {
    return <div className="text-center text-blue-200">Loading forecast data...</div>
  }

  return (
    <Card className="w-full bg-gray-800/50 border-none">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-blue-300">{city.name} - 3 Day Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" tick={{ fill: '#9CA3AF' }} />
            <YAxis yAxisId="left" tick={{ fill: '#9CA3AF' }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#9CA3AF' }} />
            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#3B82F6" name="Temperature (°C)" />
            <Line yAxisId="left" type="monotone" dataKey="humidity" stroke="#10B981" name="Humidity (%)" />
            <Line yAxisId="right" type="monotone" dataKey="windSpeed" stroke="#F59E0B" name="Wind Speed (km/h)" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

