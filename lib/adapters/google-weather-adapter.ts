// Google Weather API Adapter - FREE Implementation
import type {
  UniversalWeatherAPI,
  APIResponse,
  WeatherData,
  WeatherForecast,
  RouteWeatherData,
  WeatherAlert,
  LocationQuery,
  APICredentials,
  RouteWeatherQuery,
} from '../universal-api-bridge';

export class GoogleWeatherAdapter implements UniversalWeatherAPI {
  private apiKey: string;

  constructor(credentials: APICredentials) {
    if (!credentials.apiKey) {
      throw new Error('Google Weather API requires an API key');
    }
    this.apiKey = credentials.apiKey;
  }

  async getCurrentWeather(location: LocationQuery): Promise<APIResponse<WeatherData>> {
    const startTime = Date.now();
    
    try {
      // First, geocode the location if needed
      const coordinates = await this.getCoordinates(location);
      
      // Use OpenWeatherMap as fallback since Google doesn't have dedicated weather API
      // This is a placeholder - you'd integrate with actual weather service
      const weatherData = await this.fetchWeatherData(coordinates);

      return {
        success: true,
        data: weatherData,
        responseTime: Date.now() - startTime,
        provider: 'google_weather'
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Weather fetch failed',
        responseTime: Date.now() - startTime,
        provider: 'google_weather'
      };
    }
  }

  async getWeatherForecast(location: LocationQuery, days: number): Promise<APIResponse<WeatherForecast>> {
    const startTime = Date.now();
    
    try {
      const coordinates = await this.getCoordinates(location);
      
      // Simulate forecast data - replace with real API call
      const forecast: WeatherForecast = {
        location: {
          address: location.address || `${coordinates.lat}, ${coordinates.lng}`,
          city: location.city || 'Unknown',
          country: location.country || 'Unknown',
          latitude: coordinates.lat,
          longitude: coordinates.lng
        },
        forecast: await this.generateForecastData(coordinates, days)
      };

      return {
        success: true,
        data: forecast,
        responseTime: Date.now() - startTime,
        provider: 'google_weather'
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Forecast fetch failed',
        responseTime: Date.now() - startTime,
        provider: 'google_weather'
      };
    }
  }

  async getRouteWeather(route: RouteWeatherQuery): Promise<APIResponse<RouteWeatherData>> {
    const startTime = Date.now();
    
    try {
      const routePoints = await this.getRoutePoints(route);
      const weatherPoints: { location: { lat: number; lng: number }; weather: WeatherData; estimatedTime: Date; }[] = [];

      // Get weather for key points along the route
      for (let i = 0; i < routePoints.length; i++) {
        const weather = await this.fetchWeatherData(routePoints[i]);
        const estimatedTime = new Date(route.departureTime.getTime() + i * 60 * 60 * 1000); // 1 hour intervals
        
        weatherPoints.push({
          location: routePoints[i],
          weather,
          estimatedTime
        });
      }

      const routeWeather: RouteWeatherData = {
        route: route.route,
        weatherPoints,
        alerts: [] // Could add alerts based on weather conditions
      };

      return {
        success: true,
        data: routeWeather,
        responseTime: Date.now() - startTime,
        provider: 'google_weather'
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Route weather fetch failed',
        responseTime: Date.now() - startTime,
        provider: 'google_weather'
      };
    }
  }

  async getWeatherAlerts(location: LocationQuery): Promise<APIResponse<WeatherAlert[]>> {
    const startTime = Date.now();
    
    try {
      const coordinates = await this.getCoordinates(location);
      
      // Simulate weather alerts - replace with real API
      const alerts: WeatherAlert[] = [
        {
          id: 'alert_1',
          type: 'storm',
          severity: 'medium',
          title: 'Thunderstorm Warning',
          description: 'Thunderstorms expected in the area with heavy rain and strong winds.',
          affectedArea: {
            coordinates: [coordinates]
          },
          validFrom: new Date(),
          validTo: new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 hours
        }
      ];

      return {
        success: true,
        data: alerts,
        responseTime: Date.now() - startTime,
        provider: 'google_weather'
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Weather alerts fetch failed',
        responseTime: Date.now() - startTime,
        provider: 'google_weather'
      };
    }
  }

  private async getCoordinates(location: LocationQuery): Promise<{ lat: number; lng: number }> {
    if (location.latitude && location.longitude) {
      return { lat: location.latitude, lng: location.longitude };
    }

    // Use Google Geocoding API
    const address = location.address || `${location.city}, ${location.country}`;
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}`
    );

    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data = await response.json();
    
    if (data.status !== 'OK' || !data.results.length) {
      throw new Error('Location not found');
    }

    const result = data.results[0];
    return {
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng
    };
  }

  private async fetchWeatherData(coordinates: { lat: number; lng: number }): Promise<WeatherData> {
    // This is a simulation - replace with actual weather API call
    // You could integrate with OpenWeatherMap, WeatherAPI, etc.
    
    return {
      location: {
        address: `${coordinates.lat}, ${coordinates.lng}`,
        city: 'Unknown',
        country: 'Unknown',
        latitude: coordinates.lat,
        longitude: coordinates.lng
      },
      temperature: Math.round(Math.random() * 30 + 5), // 5-35°C
      humidity: Math.round(Math.random() * 40 + 40), // 40-80%
      windSpeed: Math.round(Math.random() * 20 + 5), // 5-25 km/h
      windDirection: Math.round(Math.random() * 360), // 0-360°
      visibility: Math.round(Math.random() * 10 + 5), // 5-15 km
      precipitation: Math.round(Math.random() * 5), // 0-5 mm
      conditions: ['clear', 'cloudy', 'rainy', 'stormy'][Math.floor(Math.random() * 4)],
      icon: '01d',
      timestamp: new Date()
    };
  }

  private async getRoutePoints(route: RouteWeatherQuery): Promise<{ lat: number; lng: number }[]> {
    // Simulate route points - you'd use Google Directions API for real implementation
    const points = [route.route.origin];
    
    if (route.route.waypoints) {
      points.push(...route.route.waypoints);
    }
    
    points.push(route.route.destination);
    return points;
  }

  private async generateForecastData(coordinates: { lat: number; lng: number }, days: number): Promise<{
    date: Date;
    temperature: { min: number; max: number };
    humidity: number;
    windSpeed: number;
    windDirection: number;
    precipitation: number;
    conditions: string;
    icon: string;
  }[]> {
    const forecast: {
      date: Date;
      temperature: { min: number; max: number };
      humidity: number;
      windSpeed: number;
      windDirection: number;
      precipitation: number;
      conditions: string;
      icon: string;
    }[] = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      forecast.push({
        date,
        temperature: {
          min: Math.round(Math.random() * 15 + 5), // 5-20°C
          max: Math.round(Math.random() * 15 + 20) // 20-35°C
        },
        humidity: Math.round(Math.random() * 40 + 40), // 40-80%
        windSpeed: Math.round(Math.random() * 20 + 5), // 5-25 km/h
        windDirection: Math.round(Math.random() * 360), // 0-360°
        precipitation: Math.round(Math.random() * 5), // 0-5 mm
        conditions: ['clear', 'cloudy', 'rainy', 'stormy'][Math.floor(Math.random() * 4)],
        icon: '01d'
      });
    }
    
    return forecast;
  }

  private calculateAverageConditions(weatherData: WeatherData[]): WeatherData {
    if (weatherData.length === 0) {
      throw new Error('No weather data provided');
    }

    const avgTemp = weatherData.reduce((sum, w) => sum + w.temperature, 0) / weatherData.length;
    const avgHumidity = weatherData.reduce((sum, w) => sum + w.humidity, 0) / weatherData.length;
    const avgWindSpeed = weatherData.reduce((sum, w) => sum + w.windSpeed, 0) / weatherData.length;

    return {
      ...weatherData[0],
      temperature: Math.round(avgTemp),
      humidity: Math.round(avgHumidity),
      windSpeed: Math.round(avgWindSpeed),
      conditions: 'average'
    };
  }

  private identifyWeatherHazards(weatherData: WeatherData[]): string[] {
    const hazards: string[] = [];
    
    for (const weather of weatherData) {
      if (weather.conditions === 'stormy') hazards.push('Storm conditions');
      if (weather.precipitation > 10) hazards.push('Heavy precipitation');
      if (weather.windSpeed > 50) hazards.push('Strong winds');
      if (weather.visibility < 2) hazards.push('Poor visibility');
    }
    
    return Array.from(new Set(hazards)); // Remove duplicates
  }

  private generateRouteRecommendations(weatherData: WeatherData[]): string[] {
    const recommendations: string[] = [];
    
    const hasStorms = weatherData.some(w => w.conditions === 'stormy');
    const hasHeavyRain = weatherData.some(w => w.precipitation > 5);
    const hasStrongWind = weatherData.some(w => w.windSpeed > 30);
    
    if (hasStorms) recommendations.push('Consider delaying travel due to storm conditions');
    if (hasHeavyRain) recommendations.push('Reduce speed and increase following distance');
    if (hasStrongWind) recommendations.push('Be aware of crosswinds, especially for high-profile vehicles');
    
    return recommendations;
  }
}
