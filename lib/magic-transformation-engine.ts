// 🎩 Magic Transformation Engine - Inteligența API-ului
// Transformă date incomplete în oferte complete și inteligente

interface CargoInput {
  fromCountry?: string;
  toCountry?: string;
  fromPostalCode?: string;
  toPostalCode?: string;
  weight?: number;
  price?: number;
  flexibleDate?: boolean;
  loadingDate?: string;
  deliveryDate?: string;
  title?: string;
  urgency?: string;
  cargoType?: string;
  [key: string]: any;
}

interface MagicOutput extends CargoInput {
  title: string;
  fromCity: string;
  toCity: string;
  fromAddress: string;
  toAddress: string;
  cargoType: string;
  urgency: 'low' | 'medium' | 'high';
  estimatedDistance?: number;
  recommendedVehicle?: string;
  estimatedDuration?: string;
  suggestions: string[];
  adaptations: string[];
}

export class MagicTransformationEngine {
  private adaptationLog: string[] = [];

  constructor() {
    console.log('🎩 Magic Transformation Engine initialized');
  }

  async transform(input: CargoInput): Promise<MagicOutput> {
    console.log('🎭 Starting magic transformation for:', input);
    this.adaptationLog = [];

    // Detect transformation context
    const context = this.analyzeContext(input);
    console.log('🧠 Context detected:', context);

    // Apply appropriate transformation
    let result: MagicOutput;
    switch (context.type) {
      case 'minimal_location':
        result = await this.transformMinimalLocation(input);
        break;
      case 'urgent_request':
        result = await this.transformUrgentRequest(input);
        break;
      case 'time_sensitive':
        result = await this.transformTimeSensitive(input);
        break;
      case 'international':
        result = await this.transformInternational(input);
        break;
      default:
        result = await this.transformStandard(input);
    }

    console.log('✨ Transformation complete:', result);
    return result;
  }

  private analyzeContext(input: CargoInput) {
    // Detect urgent patterns
    if (input.urgency === 'high' || input.title?.toLowerCase().includes('urgent')) {
      return { type: 'urgent_request', confidence: 0.9 };
    }

    // Detect time sensitive
    if (input.deliveryDate) {
      const deliveryDate = new Date(input.deliveryDate);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      if (deliveryDate <= tomorrow) {
        return { type: 'time_sensitive', confidence: 0.8 };
      }
    }

    // Detect international transport
    if (input.fromCountry && input.toCountry && input.fromCountry !== input.toCountry) {
      return { type: 'international', confidence: 0.7 };
    }

    // Detect minimal location input
    if (input.fromCountry && input.toCountry && input.weight && input.price) {
      return { type: 'minimal_location', confidence: 0.6 };
    }

    return { type: 'standard', confidence: 0.5 };
  }

  // 🗺️ TRANSFORMAREA 1: Locație + Greutate → Ofertă Completă
  private async transformMinimalLocation(input: CargoInput): Promise<MagicOutput> {
    console.log('🗺️ Applying minimal location transformation');

    const fromCity = await this.getCityFromPostal(input.fromPostalCode) || 'Unknown City';
    const toCity = await this.getCityFromPostal(input.toPostalCode) || 'Unknown City';
    const distance = this.estimateDistance(fromCity, toCity);
    
    this.adaptationLog.push(`Generated cities: ${fromCity} → ${toCity}`);
    this.adaptationLog.push(`Estimated distance: ${distance}km`);

    return {
      ...input,
      title: input.title || `Transport ${fromCity} → ${toCity} (${input.weight}kg)`,
      fromCity,
      toCity,
      fromAddress: input.fromAddress || `${fromCity}, ${input.fromCountry}`,
      toAddress: input.toAddress || `${toCity}, ${input.toCountry}`,
      cargoType: input.cargoType || this.guessCargoFromWeight(input.weight!),
      urgency: (input.urgency as any) || 'medium',
      estimatedDistance: distance,
      recommendedVehicle: this.selectVehicleForWeight(input.weight!),
      estimatedDuration: this.calculateDuration(distance),
      loadingDate: input.loadingDate || this.getNextBusinessDay(),
      deliveryDate: input.deliveryDate || this.getOptimalDeliveryDate(distance),
      suggestions: [
        `Vehicul recomandat: ${this.selectVehicleForWeight(input.weight!)}`,
        `Durata estimată: ${this.calculateDuration(distance)}`,
        `Distanța: ~${distance}km via ruta optimă`
      ],
      adaptations: [...this.adaptationLog]
    };
  }

  // 🚨 TRANSFORMAREA 2: Urgent + Preț → Prioritate Maximă
  private async transformUrgentRequest(input: CargoInput): Promise<MagicOutput> {
    console.log('🚨 Applying urgent request transformation');

    this.adaptationLog.push('Urgent mode activated');
    this.adaptationLog.push('Express scheduling applied');

    return {
      ...input,
      title: input.title || 'Transport URGENT',
      fromCity: await this.getCityFromPostal(input.fromPostalCode) || 'Start Location',
      toCity: await this.getCityFromPostal(input.toPostalCode) || 'End Location',
      fromAddress: input.fromAddress || `${input.fromCountry}`,
      toAddress: input.toAddress || `${input.toCountry}`,
      cargoType: input.cargoType || 'Express Cargo',
      urgency: 'high',
      loadingDate: input.loadingDate || this.getNextAvailableSlot(),
      deliveryDate: input.deliveryDate || this.getExpressDelivery(),
      recommendedVehicle: 'Express Van',
      estimatedDuration: 'Express - ASAP',
      suggestions: [
        '🚨 Transport urgent activat',
        '🚐 Vehicule express disponibile',
        '⏰ Ridicare în max 2 ore'
      ],
      adaptations: [...this.adaptationLog]
    };
  }

  // ⏰ TRANSFORMAREA 3: "Tomorrow" → Express cu Vehicule
  private async transformTimeSensitive(input: CargoInput): Promise<MagicOutput> {
    console.log('⏰ Applying time sensitive transformation');

    const availableVehicles = this.findAvailableVehicles();
    this.adaptationLog.push(`Found ${availableVehicles.length} vehicles for tomorrow`);

    return {
      ...input,
      title: input.title || 'Transport Express - Mâine',
      fromCity: await this.getCityFromPostal(input.fromPostalCode) || 'Start',
      toCity: await this.getCityFromPostal(input.toPostalCode) || 'Destination',
      fromAddress: input.fromAddress || `${input.fromCountry}`,
      toAddress: input.toAddress || `${input.toCountry}`,
      cargoType: input.cargoType || 'Time Sensitive',
      urgency: 'high',
      recommendedVehicle: availableVehicles[0] || 'Van Express',
      estimatedDuration: 'Same day delivery',
      suggestions: [
        `🚛 ${availableVehicles.length} vehicule disponibile pentru mâine`,
        '⏰ Ridicare de la 06:00',
        '📦 Livrare în aceeași zi'
      ],
      adaptations: [...this.adaptationLog]
    };
  }

  // 🌍 TRANSFORMAREA 4: Transport Internațional
  private async transformInternational(input: CargoInput): Promise<MagicOutput> {
    console.log('🌍 Applying international transport transformation');

    this.adaptationLog.push('International transport detected');
    this.adaptationLog.push('Border crossing requirements added');

    const fromCity = await this.getCityFromPostal(input.fromPostalCode) || 'Origin';
    const toCity = await this.getCityFromPostal(input.toPostalCode) || 'Destination';

    return {
      ...input,
      title: input.title || `Transport Internațional ${input.fromCountry} → ${input.toCountry}`,
      fromCity,
      toCity,
      fromAddress: input.fromAddress || `${fromCity}, ${input.fromCountry}`,
      toAddress: input.toAddress || `${toCity}, ${input.toCountry}`,
      cargoType: input.cargoType || 'International Cargo',
      urgency: (input.urgency as any) || 'medium',
      recommendedVehicle: 'Camion International',
      estimatedDuration: '2-4 zile (cu vamă)',
      loadingDate: input.loadingDate || this.getNextBusinessDay(),
      deliveryDate: input.deliveryDate || this.getInternationalDelivery(),
      suggestions: [
        '🌍 Transport internațional configurat',
        '📋 Documente vamă necesare',
        '🚛 Vehicul autorizat pentru frontieră'
      ],
      adaptations: [...this.adaptationLog]
    };
  }

  // 📦 TRANSFORMAREA 5: Standard
  private async transformStandard(input: CargoInput): Promise<MagicOutput> {
    console.log('📦 Applying standard transformation');

    return {
      ...input,
      title: input.title || 'Transport Standard',
      fromCity: await this.getCityFromPostal(input.fromPostalCode) || 'Start',
      toCity: await this.getCityFromPostal(input.toPostalCode) || 'End',
      fromAddress: input.fromAddress || `${input.fromCountry}`,
      toAddress: input.toAddress || `${input.toCountry}`,
      cargoType: input.cargoType || 'General',
      urgency: (input.urgency as any) || 'medium',
      recommendedVehicle: this.selectVehicleForWeight(input.weight || 10),
      estimatedDuration: '2-3 zile',
      suggestions: [
        'Transport standard configurat',
        'Programare flexibilă disponibilă'
      ],
      adaptations: [...this.adaptationLog]
    };
  }

  // 🧠 Helper Functions - Inteligența Magică
  private async getCityFromPostal(postalCode?: string): Promise<string | null> {
    if (!postalCode) return null;
    
    // Simulare API postal code → city
    const postalMap: { [key: string]: string } = {
      '123456': 'București',
      '654321': 'Cluj-Napoca',
      '789012': 'Berlin',
      '345678': 'Vienna'
    };
    
    return postalMap[postalCode] || `City-${postalCode.slice(0, 3)}`;
  }

  private estimateDistance(fromCity: string, toCity: string): number {
    // Distanțe aproximative între orașe majore
    const distances: { [key: string]: number } = {
      'București-Cluj-Napoca': 450,
      'București-Berlin': 1200,
      'Cluj-Napoca-Vienna': 600
    };
    
    return distances[`${fromCity}-${toCity}`] || distances[`${toCity}-${fromCity}`] || 300;
  }

  private guessCargoFromWeight(weight: number): string {
    if (weight <= 5) return 'Colete Mici';
    if (weight <= 50) return 'Marfă Generală';
    if (weight <= 500) return 'Marfă Medie';
    return 'Marfă Mare';
  }

  private selectVehicleForWeight(weight: number): string {
    if (weight <= 5) return 'Curier Moto';
    if (weight <= 50) return 'Van / Dublă';
    if (weight <= 500) return 'Camioneta 3.5T';
    if (weight <= 2000) return 'Camion 7.5T';
    return 'Camion Mare';
  }

  private calculateDuration(distance: number): string {
    const hours = Math.ceil(distance / 80); // 80km/h average
    if (hours <= 8) return `${hours} ore`;
    const days = Math.ceil(hours / 8);
    return `${days} zi${days > 1 ? 'le' : ''}`;
  }

  private getNextBusinessDay(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  private getOptimalDeliveryDate(distance: number): string {
    const days = Math.ceil(distance / 400) + 1; // 400km per day + 1 day buffer
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }

  private getNextAvailableSlot(): string {
    const now = new Date();
    now.setHours(now.getHours() + 2); // Next available in 2 hours
    return now.toISOString().split('T')[0];
  }

  private getExpressDelivery(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  private getInternationalDelivery(): string {
    const date = new Date();
    date.setDate(date.getDate() + 4); // 4 days for international
    return date.toISOString().split('T')[0];
  }

  private findAvailableVehicles(): string[] {
    return ['Van Express #1', 'Camioneta Rapidă #3', 'Curier Moto #7'];
  }

  public getAdaptationLog(): string[] {
    return this.adaptationLog;
  }
}

export const magicEngine = new MagicTransformationEngine();