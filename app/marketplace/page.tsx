'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Truck, 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Weight, 
  Package, 
  Clock,
  Euro,
  ArrowRight,
  Star,
  Shield,
  Users,
  ChevronDown,
  FileText,
  Phone,
  Mail,
  CheckCircle,
  AlertTriangle,
  Plus
} from 'lucide-react';

interface CargoOffer {
  id: string;
  title: string;
  from: string;
  to: string;
  distance: number;
  weight: number;
  volume: number;
  cargoType: string;
  loadingDate: string;
  deliveryDate: string;
  price: number;
  priceType: 'fixed' | 'negotiable' | 'per_km';
  company: {
    name: string;
    rating: number;
    verified: boolean;
    totalTransports: number;
  };
  requirements: string[];
  truckType: string;
  status: 'active' | 'pending' | 'completed';
  urgency: 'low' | 'medium' | 'high';
  createdAt: string;
}

interface TransportRequest {
  id: string;
  from: string;
  to: string;
  truckType: string;
  availableFrom: string;
  availableTo: string;
  priceRange: {
    min: number;
    max: number;
  };
  company: {
    name: string;
    rating: number;
    verified: boolean;
    fleetSize: number;
  };
  capabilities: string[];
  status: 'available' | 'booked' | 'en_route';
}

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState<'post-cargo' | 'find-cargo' | 'find-transport'>('find-cargo');
  const [searchFilters, setSearchFilters] = useState({
    from: '',
    to: '',
    loadingDate: '',
    cargoType: '',
    weight: '',
    priceMax: '',
    truckType: ''
  });
  const [cargoOffers, setCargoOffers] = useState<CargoOffer[]>([]);
  const [transportRequests, setTransportRequests] = useState<TransportRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data pentru demonstrație
  useEffect(() => {
    const mockCargoOffers: CargoOffer[] = [
      {
        id: '1',
        title: 'Transport electronice București - Hamburg',
        from: 'București, România',
        to: 'Hamburg, Germania',
        distance: 1450,
        weight: 15000,
        volume: 45,
        cargoType: 'electronice',
        loadingDate: '2024-03-15',
        deliveryDate: '2024-03-18',
        price: 2500,
        priceType: 'fixed',
        company: {
          name: 'LogiTrans SRL',
          rating: 4.8,
          verified: true,
          totalTransports: 2547
        },
        requirements: ['Frigorific', 'ADR', 'Asigurare extinsă'],
        truckType: 'Semiremorcă 13.6m',
        status: 'active',
        urgency: 'medium',
        createdAt: '2024-03-10'
      },
      {
        id: '2',
        title: 'Marfă alimentară urgentă Cluj - Paris',
        from: 'Cluj-Napoca, România',
        to: 'Paris, Franța',
        distance: 1820,
        weight: 22000,
        volume: 65,
        cargoType: 'alimentare',
        loadingDate: '2024-03-14',
        deliveryDate: '2024-03-16',
        price: 3200,
        priceType: 'negotiable',
        company: {
          name: 'FreshCargo International',
          rating: 4.9,
          verified: true,
          totalTransports: 1234
        },
        requirements: ['Refrigerare -18°C', 'HACCP', 'Express delivery'],
        truckType: 'Frigorific 13.6m',
        status: 'active',
        urgency: 'high',
        createdAt: '2024-03-12'
      },
      {
        id: '3',
        title: 'Materiale de construcție Timișoara - Milano',
        from: 'Timișoara, România',
        to: 'Milano, Italia',
        distance: 980,
        weight: 24000,
        volume: 35,
        cargoType: 'materiale_constructii',
        loadingDate: '2024-03-16',
        deliveryDate: '2024-03-19',
        price: 1.85,
        priceType: 'per_km',
        company: {
          name: 'BuildLogistics Pro',
          rating: 4.6,
          verified: true,
          totalTransports: 876
        },
        requirements: ['Încărcare cu macara', 'Permit special'],
        truckType: 'Camion cu macara',
        status: 'active',
        urgency: 'low',
        createdAt: '2024-03-09'
      }
    ];

    const mockTransportRequests: TransportRequest[] = [
      {
        id: '1',
        from: 'București, România',
        to: 'Germania',
        truckType: 'Semiremorcă',
        availableFrom: '2024-03-15',
        availableTo: '2024-03-20',
        priceRange: { min: 1200, max: 2800 },
        company: {
          name: 'EuroFleet Transport',
          rating: 4.7,
          verified: true,
          fleetSize: 45
        },
        capabilities: ['ADR', 'Frigorific', 'Oversized'],
        status: 'available'
      },
      {
        id: '2',
        from: 'Cluj-Napoca, România',
        to: 'Franța',
        truckType: 'Frigorific',
        availableFrom: '2024-03-14',
        availableTo: '2024-03-18',
        priceRange: { min: 2000, max: 3500 },
        company: {
          name: 'ColdChain Logistics',
          rating: 4.9,
          verified: true,
          fleetSize: 28
        },
        capabilities: ['Refrigerare', 'HACCP', 'Express'],
        status: 'available'
      }
    ];

    setCargoOffers(mockCargoOffers);
    setTransportRequests(mockTransportRequests);
    setLoading(false);
  }, []);

  const getPriceDisplay = (offer: CargoOffer) => {
    switch (offer.priceType) {
      case 'fixed':
        return `€${offer.price.toLocaleString()}`;
      case 'per_km':
        return `€${offer.price}/km`;
      case 'negotiable':
        return `€${offer.price.toLocaleString()} (negociabil)`;
      default:
        return `€${offer.price.toLocaleString()}`;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-xl font-light text-white">Loading Marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Transport Marketplace
          </h1>
          <p className="text-slate-300 text-lg">
            Platformă logistică pentru conectarea expeditorilor cu transportatorii
          </p>
        </motion.div>

        {/* Main Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-slate-700">
              <TabsTrigger value="post-cargo" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Package className="w-4 h-4 mr-2" />
                Depune Marfă
              </TabsTrigger>
              <TabsTrigger value="find-cargo" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Search className="w-4 h-4 mr-2" />
                Caută Marfă
              </TabsTrigger>
              <TabsTrigger value="find-transport" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Truck className="w-4 h-4 mr-2" />
                Caută Transport
              </TabsTrigger>
            </TabsList>

            {/* Depune Marfă Tab */}
            <TabsContent value="post-cargo" className="mt-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Package className="w-5 h-5 mr-2 text-blue-400" />
                    Publică o ofertă de marfă
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Completează formularul pentru a găsi transportatori pentru marfa ta
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Punct de încărcare</label>
                      <Input 
                        placeholder="Orașul de încărcare"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Punct de descărcare</label>
                      <Input 
                        placeholder="Orașul de descărcare"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Data încărcării</label>
                      <Input 
                        type="date"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Greutate (kg)</label>
                      <Input 
                        type="number"
                        placeholder="Ex: 15000"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Volum (m³)</label>
                      <Input 
                        type="number"
                        placeholder="Ex: 45"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Tip marfă</label>
                      <select className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2">
                        <option>Selectează tipul marfii</option>
                        <option>Electronice</option>
                        <option>Alimentare</option>
                        <option>Materiale construcții</option>
                        <option>Textile</option>
                        <option>Chimicale</option>
                        <option>Altele</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Preț oferit (€)</label>
                      <Input 
                        type="number"
                        placeholder="Ex: 2500"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Cerințe speciale</label>
                    <textarea 
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 h-24"
                      placeholder="Ex: Frigorific, ADR, Asigurare extinsă..."
                    />
                  </div>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Publică oferta
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Caută Marfă Tab */}
            <TabsContent value="find-cargo" className="mt-6">
              {/* Search Filters */}
              <Card className="bg-slate-800/50 border-slate-700 mb-6">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <Input 
                      placeholder="De la..."
                      value={searchFilters.from}
                      onChange={(e) => setSearchFilters({...searchFilters, from: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <Input 
                      placeholder="Către..."
                      value={searchFilters.to}
                      onChange={(e) => setSearchFilters({...searchFilters, to: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <Input 
                      type="date"
                      value={searchFilters.loadingDate}
                      onChange={(e) => setSearchFilters({...searchFilters, loadingDate: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Search className="w-4 h-4 mr-2" />
                      Caută
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <select 
                      value={searchFilters.cargoType}
                      onChange={(e) => setSearchFilters({...searchFilters, cargoType: e.target.value})}
                      className="bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2"
                    >
                      <option value="">Toate tipurile</option>
                      <option value="electronice">Electronice</option>
                      <option value="alimentare">Alimentare</option>
                      <option value="materiale_constructii">Materiale construcții</option>
                    </select>
                    <Input 
                      type="number"
                      placeholder="Greutate max (kg)"
                      value={searchFilters.weight}
                      onChange={(e) => setSearchFilters({...searchFilters, weight: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <Input 
                      type="number"
                      placeholder="Preț max (€)"
                      value={searchFilters.priceMax}
                      onChange={(e) => setSearchFilters({...searchFilters, priceMax: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <select 
                      value={searchFilters.truckType}
                      onChange={(e) => setSearchFilters({...searchFilters, truckType: e.target.value})}
                      className="bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2"
                    >
                      <option value="">Toate tipurile camion</option>
                      <option value="semiremorcha">Semiremorcă</option>
                      <option value="frigorific">Frigorific</option>
                      <option value="macara">Cu macara</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* Cargo Offers List */}
              <div className="space-y-4">
                {cargoOffers.map((offer) => (
                  <motion.div
                    key={offer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-white">{offer.title}</h3>
                          <Badge className={`${getUrgencyColor(offer.urgency)} text-xs`}>
                            {offer.urgency === 'high' ? 'URGENT' : offer.urgency === 'medium' ? 'NORMAL' : 'FLEXIBIL'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center text-slate-300 mb-2">
                          <MapPin className="w-4 h-4 mr-1 text-blue-400" />
                          <span className="text-sm">{offer.from}</span>
                          <ArrowRight className="w-4 h-4 mx-2 text-slate-500" />
                          <span className="text-sm">{offer.to}</span>
                          <span className="text-slate-500 text-sm ml-2">({offer.distance} km)</span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-400">
                          <div className="flex items-center">
                            <Weight className="w-4 h-4 mr-1 text-blue-400" />
                            {offer.weight.toLocaleString()} kg
                          </div>
                          <div className="flex items-center">
                            <Package className="w-4 h-4 mr-1 text-blue-400" />
                            {offer.volume} m³
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1 text-blue-400" />
                            {new Date(offer.loadingDate).toLocaleDateString('ro-RO')}
                          </div>
                          <div className="flex items-center">
                            <Truck className="w-4 h-4 mr-1 text-blue-400" />
                            {offer.truckType}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-400 mb-1">
                          {getPriceDisplay(offer)}
                        </div>
                        <div className="flex items-center text-sm text-slate-400 mb-2">
                          <Star className="w-4 h-4 mr-1 text-yellow-400" />
                          {offer.company.rating}
                          {offer.company.verified && (
                            <Shield className="w-4 h-4 ml-1 text-blue-400" />
                          )}
                        </div>
                        <p className="text-sm text-slate-300">{offer.company.name}</p>
                        <p className="text-xs text-slate-500">{offer.company.totalTransports} transporturi</p>
                      </div>
                    </div>

                    {offer.requirements.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-slate-400 mb-2">Cerințe speciale:</p>
                        <div className="flex flex-wrap gap-2">
                          {offer.requirements.map((req, index) => (
                            <Badge key={index} variant="outline" className="text-xs border-blue-500 text-blue-400">
                              {req}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t border-slate-700">
                      <div className="flex items-center text-sm text-slate-400">
                        <Clock className="w-4 h-4 mr-1" />
                        Publicat {new Date(offer.createdAt).toLocaleDateString('ro-RO')}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                          <Phone className="w-4 h-4 mr-1" />
                          Contact
                        </Button>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <FileText className="w-4 h-4 mr-1" />
                          Aplică
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Caută Transport Tab */}
            <TabsContent value="find-transport" className="mt-6">
              <div className="space-y-4">
                {transportRequests.map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center text-slate-300 mb-2">
                          <MapPin className="w-4 h-4 mr-1 text-blue-400" />
                          <span className="text-sm">{request.from}</span>
                          <ArrowRight className="w-4 h-4 mx-2 text-slate-500" />
                          <span className="text-sm">{request.to}</span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-slate-400 mb-4">
                          <div className="flex items-center">
                            <Truck className="w-4 h-4 mr-1 text-blue-400" />
                            {request.truckType}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1 text-blue-400" />
                            {new Date(request.availableFrom).toLocaleDateString('ro-RO')}
                          </div>
                          <div className="flex items-center">
                            <Euro className="w-4 h-4 mr-1 text-blue-400" />
                            €{request.priceRange.min} - €{request.priceRange.max}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {request.capabilities.map((capability, index) => (
                            <Badge key={index} variant="outline" className="text-xs border-green-500 text-green-400">
                              {capability}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center text-sm text-slate-400 mb-2">
                          <Star className="w-4 h-4 mr-1 text-yellow-400" />
                          {request.company.rating}
                          {request.company.verified && (
                            <Shield className="w-4 h-4 ml-1 text-blue-400" />
                          )}
                        </div>
                        <p className="text-sm text-slate-300 mb-1">{request.company.name}</p>
                        <p className="text-xs text-slate-500">{request.company.fleetSize} camioane</p>
                        <Badge className={request.status === 'available' ? 'bg-green-500 text-white mt-2' : 'bg-gray-500 text-white mt-2'}>
                          {request.status === 'available' ? 'Disponibil' : 'Ocupat'}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-700 mt-4">
                      <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                        <Mail className="w-4 h-4 mr-1" />
                        Mesaj
                      </Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Rezervă
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
