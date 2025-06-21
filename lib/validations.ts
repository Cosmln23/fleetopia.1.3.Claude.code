import { z } from 'zod';

// Common validation schemas
export const paginationSchema = z.object({
  page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 20),
});

export const idSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

// Vehicle validation schemas
export const createVehicleSchema = z.object({
  name: z.string().min(1, 'Vehicle name is required').max(100, 'Name too long'),
  type: z.string().min(1, 'Vehicle type is required').max(50, 'Type too long'),
  licensePlate: z.string().min(1, 'License plate is required').max(20, 'License plate too long'),
  driverName: z.string().min(1, 'Driver name is required').max(100, 'Driver name too long'),
  status: z.enum(['active', 'idle', 'maintenance', 'en_route']).optional().default('idle'),
  lat: z.number().min(-90).max(90).optional().default(0),
  lng: z.number().min(-180).max(180).optional().default(0),
  currentRoute: z.string().optional(),
  fuelConsumption: z.number().min(0).max(100).optional(),
});

export const updateVehicleSchema = createVehicleSchema.partial();

export const vehicleQuerySchema = z.object({
  status: z.enum(['active', 'idle', 'maintenance', 'en_route']).optional(),
}).merge(paginationSchema);

// Cargo offer validation schemas - SMART & FLEXIBLE
export const createCargoOfferSchema = z.object({
  // ===== OBLIGATORII (5 câmpuri critice) =====
  fromCountry: z.string().min(1, 'Țara de plecare este obligatorie').max(100, 'Country name too long'),
  toCountry: z.string().min(1, 'Țara de destinație este obligatorie').max(100, 'Country name too long'),
  fromPostalCode: z.string().min(1, 'Codul poștal de plecare este obligatoriu').max(20, 'Postal code too long'),
  toPostalCode: z.string().min(1, 'Codul poștal de destinație este obligatoriu').max(20, 'Postal code too long'),
  weight: z.number().min(0.1, 'Greutatea este obligatorie (minim 0.1kg)').max(50000, 'Weight too large'),
  price: z.number().min(0.1, 'Prețul de cerere este obligatoriu').max(1000000, 'Price too large'),
  
  // ===== DATA (obligatorie doar dacă nu e flexibilă) =====
  flexibleDate: z.boolean().optional().default(false),
  loadingDate: z.string().optional().refine((date, ctx) => {
    // Obligatorie doar dacă nu e flexibilă
    if (!ctx.parent.flexibleDate && !date) {
      return false; // Va genera eroare
    }
    return !date || !isNaN(Date.parse(date));
  }, 'Data de încărcare este obligatorie sau bifează "Data Flexibilă"'),
  
  deliveryDate: z.string().optional().refine((date, ctx) => {
    // Obligatorie doar dacă nu e flexibilă și nu e loadingDate
    if (!ctx.parent.flexibleDate && !ctx.parent.loadingDate && !date) {
      return false;
    }
    return !date || !isNaN(Date.parse(date));
  }, 'Data de livrare este obligatorie sau bifează "Data Flexibilă"'),

  // ===== OPȚIONALE (cu defaults inteligente) =====
  title: z.string().max(200, 'Title too long').optional().default(''),
  fromAddress: z.string().max(200, 'Address too long').optional().default(''),
  fromCity: z.string().max(100, 'City name too long').optional().default(''),
  toAddress: z.string().max(200, 'Address too long').optional().default(''),
  toCity: z.string().max(100, 'City name too long').optional().default(''),
  volume: z.number().min(0).max(1000, 'Volume too large').optional(),
  cargoType: z.string().max(50, 'Cargo type too long').optional().default('General'),
  priceType: z.enum(['fixed', 'negotiable', 'per_km']).optional().default('fixed'),
  companyName: z.string().max(100, "Company name is too long").optional().default(''),
  requirements: z.union([
    z.string(),
    z.array(z.string())
  ]).transform((val) => {
    if (typeof val === 'string') {
      return val.split(',').map(req => req.trim()).filter(Boolean);
    }
    return val || [];
  }).optional().default([]),
  urgency: z.enum(['low', 'medium', 'high']).optional().default('medium'),
});

export const updateCargoOfferSchema = createCargoOfferSchema.partial();

export const cargoQuerySchema = z.object({
  fromLocation: z.string().max(100).optional(),
  toLocation: z.string().max(100).optional(),
  maxWeight: z.string().optional().transform((val) => val ? parseFloat(val) : undefined),
  listType: z.enum(['all', 'my_offers', 'accepted_offers', 'conversations']).optional(),
}).merge(paginationSchema);

// Fleet validation schemas
export const createFleetSchema = z.object({
  name: z.string().min(1, 'Fleet name is required').max(100, 'Name too long'),
  status: z.enum(['active', 'inactive']).optional().default('active'),
});

// Dispatcher validation schemas
export const acceptSuggestionSchema = z.object({
  suggestionId: z.string().min(1, 'Suggestion ID is required'),
  cargoOfferId: z.string().min(1, 'Cargo offer ID is required'),
  vehicleId: z.string().min(1, 'Vehicle ID is required'),
});

// Chat validation schemas
export const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(1000, 'Message too long'),
  cargoOfferId: z.string().min(1, 'Cargo offer ID is required'),
});

// System validation schemas
export const systemConfigSchema = z.object({
  key: z.string().min(1, 'Config key is required').max(100, 'Key too long'),
  value: z.unknown(),
});

// Rate limiting validation
export const rateLimitSchema = z.object({
  identifier: z.string().min(1, 'Identifier is required'),
  limit: z.number().min(1).max(1000).default(100),
  windowMs: z.number().min(1000).max(3600000).default(900000), // 15 minutes default
});

// Authentication validation
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password too long'),
  companyName: z.string().max(100, 'Company name too long').optional(),
});

// Export type definitions
export type CreateVehicle = z.infer<typeof createVehicleSchema>;
export type UpdateVehicle = z.infer<typeof updateVehicleSchema>;
export type VehicleQuery = z.infer<typeof vehicleQuerySchema>;
export type CreateCargoOffer = z.infer<typeof createCargoOfferSchema>;
export type UpdateCargoOffer = z.infer<typeof updateCargoOfferSchema>;
export type CargoQuery = z.infer<typeof cargoQuerySchema>;
export type CreateFleet = z.infer<typeof createFleetSchema>;
export type AcceptSuggestion = z.infer<typeof acceptSuggestionSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type SystemConfig = z.infer<typeof systemConfigSchema>;
export type Login = z.infer<typeof loginSchema>;
export type Register = z.infer<typeof registerSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
