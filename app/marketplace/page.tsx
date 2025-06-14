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

  // Mock data for demonstration
  useEffect(() => {
    const mockCargoOffers: CargoOffer[] = [
      {
        id: '1',
        title: 'Electronics Transport Bucharest - Hamburg',
        from: 'Bucharest, Romania',
        to: 'Hamburg, Germany',
        distance: 1450,
        weight: 15000,
        volume: 45,
        cargoType: 'electronics',
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
        requirements: ['Refrigerated', 'ADR', 'Extended Insurance'],
        truckType: 'Semitrailer 13.6m',
        status: 'active',
        urgency: 'medium',
        createdAt: '2024-03-10'
      },
      {
        id: '2',
        title: 'Urgent Food Freight Cluj - Paris',
        from: 'Cluj-Napoca, Romania',
        to: 'Paris, France',
        distance: 1820,
        weight: 22000,
        volume: 65,
        cargoType: 'foodstuff',
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
        requirements: ['Refrigeration -18°C', 'HACCP', 'Express delivery'],
        truckType: 'Refrigerated 13.6m',
        status: 'active',
        urgency: 'high',
        createdAt: '2024-03-12'
      },
      {
        id: '3',
        title: 'Construction Materials Timisoara - Milan',
        from: 'Timișoara, Romania',
        to: 'Milan, Italy',
        distance: 980,
        weight: 24000,
        volume: 35,
        cargoType: 'construction_materials',
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
        requirements: ['Crane Loading', 'Special Permit'],
        truckType: 'Truck with crane',
        status: 'active',
        urgency: 'low',
        createdAt: '2024-03-09'
      }
    ];

    const mockTransportRequests: TransportRequest[] = [
      {
        id: '1',
        from: 'Bucharest, Romania',
        to: 'Germany',
        truckType: 'Semitrailer',
        availableFrom: '2024-03-15',
        availableTo: '2024-03-20',
        priceRange: { min: 1200, max: 2800 },
        company: {
          name: 'EuroFleet Transport',
          rating: 4.7,
          verified: true,
          fleetSize: 45
        },
        capabilities: ['ADR', 'Refrigerated', 'Oversized'],
        status: 'available'
      },
      {
        id: '2',
        from: 'Cluj-Napoca, Romania',
        to: 'France',
        truckType: 'Refrigerated',
        availableFrom: '2024-03-14',
        availableTo: '2024-03-18',
        priceRange: { min: 2000, max: 3500 },
        company: {
          name: 'ColdChain Logistics',
          rating: 4.9,
          verified: true,
          fleetSize: 28
        },
        capabilities: ['Refrigeration', 'HACCP', 'Express'],
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
        return `€${offer.price.toLocaleString()} (negotiable)`;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Logistics Marketplace</h1>
        <p className="mt-2 text-lg text-blue-200">The central hub for finding cargo and available transport.</p>
      </header>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/60 p-1 rounded-lg">
          <TabsTrigger value="post-cargo" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Plus className="mr-2 h-4 w-4"/> Post Cargo
          </TabsTrigger>
          <TabsTrigger value="find-cargo" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Search className="mr-2 h-4 w-4"/> Find Cargo
          </TabsTrigger>
          <TabsTrigger value="find-transport" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Truck className="mr-2 h-4 w-4"/> Find Transport
          </TabsTrigger>
        </TabsList>
        <TabsContent value="post-cargo" className="mt-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Create a New Cargo Offer</CardTitle>
              <CardDescription className="text-blue-200">Fill in the details below to publish your cargo for carriers.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Formularul pentru a posta marfă va fi implementat aici */}
              <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-600 rounded-lg">
                <p className="text-slate-400">Cargo posting form coming soon...</p>
                <Button className="mt-4 bg-blue-600 hover:bg-blue-700">Get Notified</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="find-cargo" className="mt-6">
          <Card className="bg-slate-800/50 border-slate-700 mb-6">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Find Cargo Offers</CardTitle>
              <CardDescription className="text-blue-200">Use the filters below to find the perfect load for your truck.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                <Input placeholder="From (e.g., Bucharest)" className="bg-slate-700 border-slate-600 text-white" />
                <Input placeholder="To (e.g., Berlin)" className="bg-slate-700 border-slate-600 text-white" />
                <Input type="date" placeholder="Loading Date" className="bg-slate-700 border-slate-600 text-white" />
                <Input placeholder="Max. Weight (kg)" className="bg-slate-700 border-slate-600 text-white" />
                <Button className="bg-blue-600 hover:bg-blue-700 lg:col-span-1 xl:col-span-1 w-full">
                  <Search className="mr-2 h-4 w-4" /> Search
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {cargoOffers.map((offer) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-slate-800/70 border-slate-700 hover:border-blue-500 transition-all duration-300 flex flex-col h-full">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-bold text-white mb-2">{offer.title}</CardTitle>
                      <Badge className={getUrgencyColor(offer.urgency) + ' text-xs'}>{offer.urgency.toUpperCase()}</Badge>
                    </div>
                    <div className="flex items-center text-sm text-blue-300">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="font-semibold">{offer.from}</span>
                      <ArrowRight className="h-4 w-4 mx-2" />
                      <span className="font-semibold">{offer.to}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Distance: {offer.distance} km</p>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div className="flex items-center text-slate-300"><Weight className="h-4 w-4 mr-2 text-blue-400"/> Weight: {offer.weight.toLocaleString()} kg</div>
                      <div className="flex items-center text-slate-300"><Package className="h-4 w-4 mr-2 text-blue-400"/> Volume: {offer.volume} m³</div>
                      <div className="flex items-center text-slate-300"><Calendar className="h-4 w-4 mr-2 text-blue-400"/> Loading: {offer.loadingDate}</div>
                      <div className="flex items-center text-slate-300"><Clock className="h-4 w-4 mr-2 text-blue-400"/> Delivery: {offer.deliveryDate}</div>
                      <div className="flex items-center text-slate-300"><Truck className="h-4 w-4 mr-2 text-blue-400"/> Truck: {offer.truckType}</div>
                      <div className="flex items-center text-slate-300 col-span-2"><FileText className="h-4 w-4 mr-2 text-blue-400"/> Type: <Badge variant="secondary" className="ml-2">{offer.cargoType}</Badge></div>
                    </div>
                    <div className="mt-4">
                      <h4 className="font-semibold text-slate-200 mb-2 text-xs">Requirements:</h4>
                      <div className="flex flex-wrap gap-2">
                        {offer.requirements.map(req => <Badge key={req} variant="outline" className="text-slate-300 border-slate-600">{req}</Badge>)}
                      </div>
                    </div>
                  </CardContent>
                  <div className="p-4 bg-slate-900/50 rounded-b-lg mt-auto">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-semibold text-slate-300">{offer.company.name}</p>
                        <div className="flex items-center text-xs text-slate-400">
                          <Star className="h-3 w-3 mr-1 text-yellow-400" /> {offer.company.rating}
                          <Users className="h-3 w-3 ml-2 mr-1 text-blue-400"/> {offer.company.totalTransports} transports
                          {offer.company.verified && <Shield className="h-3 w-3 ml-2 text-green-400" />}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-400">{getPriceDisplay(offer)}</p>
                        <Button size="sm" className="mt-1 bg-blue-600 hover:bg-blue-700 h-8">Contact</Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="find-transport" className="mt-6">
           <Card className="bg-slate-800/50 border-slate-700 mb-6">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Find Available Transport</CardTitle>
              <CardDescription className="text-blue-200">Search for available trucks for your cargo.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                <Input placeholder="Origin (e.g., Romania)" className="bg-slate-700 border-slate-600 text-white" />
                <Input placeholder="Destination (e.g., France)" className="bg-slate-700 border-slate-600 text-white" />
                <Input placeholder="Truck Type" className="bg-slate-700 border-slate-600 text-white" />
                <Input type="date" placeholder="Available from" className="bg-slate-700 border-slate-600 text-white" />
                <Button className="bg-blue-600 hover:bg-blue-700 lg:col-span-1 xl:col-span-1 w-full">
                  <Search className="mr-2 h-4 w-4" /> Search
                </Button>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {transportRequests.map((req) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="bg-slate-800/70 border-slate-700 hover:border-blue-500 transition-all duration-300 flex flex-col h-full">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-bold text-white mb-2">Transport Request: {req.truckType}</CardTitle>
                      <Badge className={req.status === 'available' ? 'bg-green-500' : 'bg-yellow-500'}>{req.status.toUpperCase()}</Badge>
                    </div>
                     <div className="flex items-center text-sm text-blue-300">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="font-semibold">{req.from}</span>
                      <ArrowRight className="h-4 w-4 mx-2" />
                      <span className="font-semibold">{req.to}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div className="flex items-center text-slate-300"><Calendar className="h-4 w-4 mr-2 text-blue-400"/> Available From: {req.availableFrom}</div>
                      <div className="flex items-center text-slate-300"><Clock className="h-4 w-4 mr-2 text-blue-400"/> Available Until: {req.availableTo}</div>
                      <div className="flex items-center text-slate-300 col-span-2"><Truck className="h-4 w-4 mr-2 text-blue-400"/> Truck Type: <Badge variant="secondary" className="ml-2">{req.truckType}</Badge></div>
                    </div>
                    <div className="mt-4">
                      <h4 className="font-semibold text-slate-200 mb-2 text-xs">Capabilities:</h4>
                      <div className="flex flex-wrap gap-2">
                        {req.capabilities.map(cap => <Badge key={cap} variant="outline" className="text-slate-300 border-slate-600">{cap}</Badge>)}
                      </div>
                    </div>
                  </CardContent>
                  <div className="p-4 bg-slate-900/50 rounded-b-lg mt-auto">
                    <div className="flex justify-between items-center">
                       <div>
                        <p className="text-sm font-semibold text-slate-300">{req.company.name}</p>
                        <div className="flex items-center text-xs text-slate-400">
                          <Star className="h-3 w-3 mr-1 text-yellow-400" /> {req.company.rating}
                          <Users className="h-3 w-3 ml-2 mr-1 text-blue-400"/> {req.company.fleetSize} trucks
                          {req.company.verified && <Shield className="h-3 w-3 ml-2 text-green-400" />}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-400">€{req.priceRange.min} - €{req.priceRange.max}</p>
                        <Button size="sm" className="mt-1 bg-blue-600 hover:bg-blue-700 h-8">View Details</Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
