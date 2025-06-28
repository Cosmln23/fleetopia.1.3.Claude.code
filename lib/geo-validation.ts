// Geographic validation utilities using Google Geocoding API
import { z } from 'zod';

interface GeocodingResult {
  isValid: boolean;
  lat?: number;
  lng?: number;
  formattedAddress?: string;
  city?: string;
  country?: string;
  postalCode?: string;
}

/**
 * Validates an address using Google Geocoding API
 * @param address - The address to validate
 * @param postalCode - Optional postal code to verify
 * @param country - Optional country to verify
 * @returns GeocodingResult with validation status and geocoded data
 */
export async function validateAddress(
  address: string, 
  postalCode?: string, 
  country?: string
): Promise<GeocodingResult> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    console.warn('Google Maps API key not found - address validation disabled');
    return { isValid: false }; // Require API key for validation
  }

  try {
    // Build search query
    let searchQuery = address;
    if (postalCode) searchQuery += `, ${postalCode}`;
    if (country) searchQuery += `, ${country}`;

    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=${apiKey}`;
    
    const response = await fetch(geocodingUrl);
    const data = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      return { isValid: false };
    }

    const result = data.results[0];
    const location = result.geometry.location;
    
    // Extract address components
    const addressComponents = result.address_components || [];
    let foundPostalCode = '';
    let foundCity = '';
    let foundCountry = '';

    addressComponents.forEach((component: any) => {
      const types = component.types;
      if (types.includes('postal_code')) {
        foundPostalCode = component.long_name;
      }
      if (types.includes('locality') || types.includes('administrative_area_level_2')) {
        foundCity = component.long_name;
      }
      if (types.includes('country')) {
        foundCountry = component.long_name;
      }
    });

    // Verify postal code if provided
    if (postalCode && foundPostalCode) {
      // Remove spaces and compare
      const cleanInputPostal = postalCode.replace(/\s/g, '').toLowerCase();
      const cleanFoundPostal = foundPostalCode.replace(/\s/g, '').toLowerCase();
      
      if (!cleanFoundPostal.includes(cleanInputPostal) && !cleanInputPostal.includes(cleanFoundPostal)) {
        return { 
          isValid: false,
          lat: location.lat,
          lng: location.lng,
          formattedAddress: result.formatted_address,
          city: foundCity,
          country: foundCountry,
          postalCode: foundPostalCode
        };
      }
    }

    return {
      isValid: true,
      lat: location.lat,
      lng: location.lng,
      formattedAddress: result.formatted_address,
      city: foundCity,
      country: foundCountry,
      postalCode: foundPostalCode
    };

  } catch (error) {
    console.error('Address validation error:', error);
    return { isValid: false }; // Reject on API errors to prevent fake addresses
  }
}

/**
 * Custom Zod validator for addresses
 */
export const addressValidator = z.string().refine(
  async (address) => {
    if (!address || address.length < 3) return false;
    const result = await validateAddress(address);
    return result.isValid;
  },
  {
    message: "Invalid address. Please enter a valid address that can be found on maps.",
  }
);

/**
 * Combined address and postal code validator
 */
export const createAddressPostalValidator = (addressField: string, postalField: string, countryField: string) => {
  return z.object({
    [addressField]: z.string().min(1, 'Address is required'),
    [postalField]: z.string().min(1, 'Postal code is required'),
    [countryField]: z.string().min(1, 'Country is required'),
  }).refine(
    async (data) => {
      const address = data[addressField as keyof typeof data] as string;
      const postal = data[postalField as keyof typeof data] as string;
      const country = data[countryField as keyof typeof data] as string;
      
      if (!address || !postal || !country) return false;
      
      const result = await validateAddress(address, postal, country);
      return result.isValid;
    },
    {
      message: "Address and postal code combination is not valid. Please verify the location exists.",
      path: [addressField], // Show error on address field
    }
  );
};