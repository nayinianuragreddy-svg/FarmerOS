'use client'

import { useEffect, useState } from 'react'
import { Droplets, Wind, AlertTriangle } from 'lucide-react'
import { fetchWeather, fetchSunriseSunset, WeatherData } from '@/lib/api'

interface WeatherWidgetProps {
  lat?: number
  lng?: number
  cityName?: string
}

export default function WeatherWidget({ lat = 17.385, lng = 78.486, cityName = 'Your Farm' }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [sunTimes, setSunTimes] = useState<{ sunrise: string; sunset: string } | null>(null)

  useEffect(() => {
    fetchWeather(lat, lng, cityName).then(data => {
      setWeather(data)
      setLoading(false)
    })
    fetchSunriseSunset(lat, lng).then(data => {
      if (data) setSunTimes({ sunrise: data.sunrise, sunset: data.sunset })
    })
  }, [lat, lng, cityName])

  // Find first forecast day with heavy rain (precipitation > 5mm) for harvest advisory
  const rainWarningDay = weather?.forecast.find(d => d.precipitation > 5)

  if (loading) {
    return (
      <div className="glass-panel p-4 animate-pulse">
        <div className="h-4 bg-white/10 rounded w-32 mb-3" />
        <div className="h-8 bg-white/10 rounded w-20 mb-3" />
        <div className="flex gap-2">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-16 bg-white/10 rounded-xl flex-1" />
          ))}
        </div>
      </div>
    )
  }

  if (!weather) return null

  return (
    <div className="glass-panel p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">
            🌦️ Farm Weather
          </p>
          <p className="text-white font-bold text-base mt-0.5">{weather.city}</p>
        </div>
        <div className="text-right">
          <p className="text-white font-bold text-3xl leading-none">{weather.temp}°</p>
          <p className="text-white/50 text-xs mt-0.5">{weather.description}</p>
        </div>
      </div>

      {/* Current stats */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs text-white/50">
          <Droplets className="w-3.5 h-3.5 text-blue-400" />
          <span>{weather.humidity}% humidity</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-white/50">
          <Wind className="w-3.5 h-3.5 text-white/40" />
          <span>{weather.wind_speed} km/h</span>
        </div>
        <div className="text-xs text-white/35">
          Feels {weather.feels_like}°C
        </div>
      </div>

      {/* Harvest advisory — rain > 5mm expected */}
      {rainWarningDay && (
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <p className="text-amber-300 text-xs font-medium">
            Rain expected {rainWarningDay.day} — consider harvesting before then
          </p>
        </div>
      )}

      {/* 7-day forecast */}
      <div className="grid grid-cols-7 gap-1">
        {weather.forecast.map((day, i) => (
          <div
            key={i}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl text-center transition ${
              day.rain
                ? 'bg-blue-500/10 border border-blue-500/15'
                : 'bg-white/4 border border-white/6'
            }`}
          >
            <p className="text-white/40 text-[10px] font-semibold">{day.day}</p>
            <span className="text-lg leading-none">{day.icon}</span>
            <p className="text-white font-bold text-xs">{day.temp_max}°</p>
            <p className="text-white/35 text-[10px]">{day.temp_min}°</p>
          </div>
        ))}
      </div>

      {/* Sunrise / Sunset footer */}
      {sunTimes && (
        <div className="flex items-center justify-between border-t border-white/6 pt-3">
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            <span>🌅</span>
            <span>Sunrise {sunTimes.sunrise}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            <span>🌇</span>
            <span>Sunset {sunTimes.sunset}</span>
          </div>
        </div>
      )}

      <p className="text-white/20 text-[10px] text-right">
        Powered by Open-Meteo (Free, no key)
      </p>
    </div>
  )
}
