
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Weather APIs - OpenWeatherMap, AccuWeather integration
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider') || 'openweathermap';
    const lat = parseFloat(searchParams.get('lat') || '40.7128');
    const lng = parseFloat(searchParams.get('lng') || '-74.0060');
    const forecast = searchParams.get('forecast') === 'true';

    // Mock weather data based on research
    const mockWeatherData = {
      openweathermap: {
        provider: 'openweathermap',
        location: { lat, lng, address: 'New York, NY' },
        current: {
          temperature: Math.floor(Math.random() * 20) + 10, // 10-30°C
          humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
          windSpeed: Math.floor(Math.random() * 15) + 5, // 5-20 km/h
          windDirection: Math.floor(Math.random() * 360),
          visibility: Math.floor(Math.random() * 5) + 10, // 10-15 km
          pressure: Math.floor(Math.random() * 50) + 1000, // 1000-1050 hPa
          conditions: ['clear', 'cloudy', 'rain', 'snow'][Math.floor(Math.random() * 4)],
          uvIndex: Math.floor(Math.random() * 10),
          dewPoint: Math.floor(Math.random() * 15) + 5
        },
        forecast: forecast ? [
          {
            date: new Date(Date.now() + 24 * 60 * 60 * 1000),
            temperature: { min: 8, max: 22 },
            conditions: 'partly_cloudy',
            precipitation: 0.2,
            windSpeed: 12
          },
          {
            date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            temperature: { min: 6, max: 18 },
            conditions: 'rain',
            precipitation: 0.8,
            windSpeed: 18
          },
          {
            date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            temperature: { min: 10, max: 25 },
            conditions: 'clear',
            precipitation: 0.0,
            windSpeed: 8
          }
        ] : null,
        alerts: Math.random() > 0.7 ? [
          {
            type: 'severe_weather',
            severity: 'moderate',
            title: 'Heavy Rain Warning',
            description: 'Heavy rain expected in the next 6 hours. Reduced visibility and slippery roads.',
            startTime: new Date(),
            endTime: new Date(Date.now() + 6 * 60 * 60 * 1000)
          }
        ] : [],
        roadRisk: Math.random() * 0.5 + 0.1, // 0.1-0.6 risk level
        visibility: Math.floor(Math.random() * 5) + 10
      },
      accuweather: {
        provider: 'accuweather',
        location: { lat, lng, address: 'New York, NY' },
        current: {
          temperature: Math.floor(Math.random() * 20) + 10,
          humidity: Math.floor(Math.random() * 40) + 40,
          windSpeed: Math.floor(Math.random() * 15) + 5,
          windDirection: Math.floor(Math.random() * 360),
          visibility: Math.floor(Math.random() * 5) + 10,
          pressure: Math.floor(Math.random() * 50) + 1000,
          conditions: ['clear', 'cloudy', 'rain', 'snow'][Math.floor(Math.random() * 4)],
          uvIndex: Math.floor(Math.random() * 10),
          dewPoint: Math.floor(Math.random() * 15) + 5,
          realFeel: Math.floor(Math.random() * 20) + 8
        },
        forecast: forecast ? [
          {
            date: new Date(Date.now() + 24 * 60 * 60 * 1000),
            temperature: { min: 7, max: 21 },
            conditions: 'partly_cloudy',
            precipitation: 0.3,
            windSpeed: 14
          }
        ] : null,
        alerts: Math.random() > 0.8 ? [
          {
            type: 'storm_warning',
            severity: 'high',
            title: 'Severe Thunderstorm Warning',
            description: 'Severe thunderstorms with hail and strong winds expected.',
            startTime: new Date(),
            endTime: new Date(Date.now() + 4 * 60 * 60 * 1000)
          }
        ] : [],
        roadRisk: Math.random() * 0.6 + 0.1,
        visibility: Math.floor(Math.random() * 5) + 10
      }
    };

    const weatherData = mockWeatherData[provider as keyof typeof mockWeatherData] || mockWeatherData.openweathermap;

    // Store weather data in database
    try {
      await prisma.weatherData.create({
        data: {
          location: weatherData.location,
          provider: weatherData.provider,
          current: weatherData.current,
          forecast: weatherData.forecast,
          alerts: weatherData.alerts,
          roadRisk: weatherData.roadRisk,
          visibility: weatherData.visibility,
          timestamp: new Date()
        }
      });

      // Generate weather alerts if severe conditions
      if (weatherData.alerts && weatherData.alerts.length > 0) {
        for (const alert of weatherData.alerts) {
          await prisma.alert.create({
            data: {
              type: 'weather',
              severity: alert.severity === 'high' ? 'critical' : alert.severity === 'moderate' ? 'high' : 'medium',
              title: alert.title,
              message: alert.description,
              data: {
                weatherAlert: alert,
                location: weatherData.location,
                roadRisk: weatherData.roadRisk
              },
              provider: weatherData.provider
            }
          });
        }
      }

      // Generate road risk alerts
      if (weatherData.roadRisk > 0.4) {
        await prisma.alert.create({
          data: {
            type: 'safety',
            severity: weatherData.roadRisk > 0.6 ? 'critical' : 'high',
            title: 'High Road Risk Warning',
            message: `Weather conditions pose increased road risk: ${Math.round(weatherData.roadRisk * 100)}%`,
            data: {
              roadRisk: weatherData.roadRisk,
              weather: weatherData.current,
              location: weatherData.location
            },
            provider: weatherData.provider
          }
        });
      }

    } catch (dbError) {
      console.warn('Failed to store weather data:', dbError);
    }

    return NextResponse.json({
      success: true,
      data: weatherData,
      forecast: forecast,
      message: `Weather data retrieved from ${provider}`,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch weather data',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    }, { status: 500 });
  }
}

// Weather alerts endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { locations, provider = 'openweathermap' } = body;

    if (!locations || !Array.isArray(locations)) {
      return NextResponse.json({
        success: false,
        error: 'Locations array is required',
        timestamp: new Date()
      }, { status: 400 });
    }

    const alerts = [];

    for (const location of locations) {
      // Mock severe weather check
      const hasSevereWeather = Math.random() > 0.6;
      
      if (hasSevereWeather) {
        const alertTypes = ['thunderstorm', 'heavy_rain', 'snow', 'fog', 'high_winds'];
        const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        
        alerts.push({
          location,
          type: alertType,
          severity: Math.random() > 0.5 ? 'high' : 'moderate',
          title: `${alertType.replace('_', ' ').toUpperCase()} Warning`,
          description: `Severe ${alertType.replace('_', ' ')} conditions detected in the area.`,
          startTime: new Date(),
          endTime: new Date(Date.now() + (Math.floor(Math.random() * 8) + 2) * 60 * 60 * 1000),
          provider
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: alerts,
      locationsChecked: locations.length,
      alertsFound: alerts.length,
      message: `Checked ${locations.length} locations for weather alerts`,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Weather alerts error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check weather alerts',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    }, { status: 500 });
  }
}
