'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Truck, 
  MapPin, 
  Euro,
  Clock,
  Weight,
  Navigation,
  Phone,
  MessageSquare,
  Star,
  ArrowRight,
  Search,
  Filter,
  Calculator,
  Fuel,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Package
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { SimpleTruckRegistration } from '@/components/simple-truck-registration';

interface CargoOffer {
  id: string;
  title: string;
  fromCity: string;
  fromCountry: string;
  toCity: string;
  toCountry: string;
  weight: number;
  price: number;
  distance: number;
  loadingDate: string;
  deliveryDate: string;
  urgency: 'low' | 'medium' | 'high';
  companyName: string;
  companyRating?: number;
  estimatedProfit?: number;
  fuelCost?: number;
}

export default function SingleTruckHome() {
  const { data: session } = useSession();
  const [cargoOffers, setCargoOffers] = useState<CargoOffer[]>([]);
  const [allOffers, setAllOffers] = useState<CargoOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [maxWeight, setMaxWeight] = useState('');
  const [selectedOffer, setSelectedOffer] = useState<CargoOffer | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [userHasTruck, setUserHasTruck] = useState(false);

  // Load real cargo offers from API
  useEffect(() => {
    const loadCargoOffers = async () => {
      try {
        const response = await fetch('/api/marketplace/cargo', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          const mappedOffers = data.offers?.map((offer: any) => ({
            id: offer.id,
            title: offer.title,
            fromCity: offer.fromLocation?.split(',')[0] || 'Unknown',
            fromCountry: offer.fromLocation?.split(',')[1]?.trim() || 'Unknown',
            toCity: offer.toLocation?.split(',')[0] || 'Unknown',
            toCountry: offer.toLocation?.split(',')[1]?.trim() || 'Unknown',
            weight: offer.weight,
            price: offer.price,
            distance: offer.distance || Math.floor(Math.random() * 1000 + 300),
            loadingDate: offer.pickupDate,
            deliveryDate: offer.deliveryDate,
            urgency: offer.priority === 'urgent' ? 'high' : offer.priority === 'normal' ? 'medium' : 'low',
            companyName: offer.companyName || 'Transport Company',
            companyRating: 4.2 + Math.random() * 0.6,
            estimatedProfit: Math.floor(offer.price * 0.7),
            fuelCost: Math.floor(offer.price * 0.3)
          })) || [];
          
          setCargoOffers(mappedOffers);
          setAllOffers(mappedOffers);
        } else {
          // Fallback to mock data if API fails
          const mockOffers: CargoOffer[] = [
            {
              id: '1',
              title: 'Piese Auto Mercedes',
              fromCity: 'București',
              fromCountry: 'România',
              toCity: 'Berlin',
              toCountry: 'Germania',
              weight: 12500,
              price: 1800,
              distance: 850,
              loadingDate: '2024-06-18',
              deliveryDate: '2024-06-20',
              urgency: 'high',
              companyName: 'AutoParts Express',
              companyRating: 4.8,
              estimatedProfit: 1260,
              fuelCost: 540
            },
            {
              id: '2',
              title: 'Produse alimentare refrigerate',
              fromCity: 'Cluj-Napoca',
              fromCountry: 'România',
              toCity: 'Milano',
              toCountry: 'Italia',
              weight: 18000,
              price: 2200,
              distance: 950,
              loadingDate: '2024-06-19',
              deliveryDate: '2024-06-21',
              urgency: 'medium',
              companyName: 'FreshFood Ltd',
              companyRating: 4.6,
              estimatedProfit: 1540,
              fuelCost: 660
            }
          ];
          setCargoOffers(mockOffers);
          setAllOffers(mockOffers);
        }
      } catch (error) {
        console.error('Error loading cargo offers:', error);
        // Fallback to empty array or mock data
        setCargoOffers([]);
        setAllOffers([]);
      } finally {
        setLoading(false);
      }
    };

    loadCargoOffers();
  }, []);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const calculateProfit = (offer: CargoOffer) => {
    const profit = offer.price - (offer.fuelCost || 0) - 200; // 200€ other costs
    const margin = (profit / offer.price) * 100;
    return { profit, margin };
  };
  
  const handleSearch = () => {
    let filtered = allOffers;
    
    if (searchFrom) {
      filtered = filtered.filter(offer => 
        offer.fromCity.toLowerCase().includes(searchFrom.toLowerCase()) ||
        offer.fromCountry.toLowerCase().includes(searchFrom.toLowerCase())
      );
    }
    
    if (searchTo) {
      filtered = filtered.filter(offer => 
        offer.toCity.toLowerCase().includes(searchTo.toLowerCase()) ||
        offer.toCountry.toLowerCase().includes(searchTo.toLowerCase())
      );
    }
    
    if (maxWeight) {
      filtered = filtered.filter(offer => offer.weight <= parseInt(maxWeight));
    }
    
    setCargoOffers(filtered);
  };
  
  const handleTruckRegistration = (data: any) => {
    console.log('Truck registered:', data);
    setUserHasTruck(true);
    setShowRegistration(false);
    // Here you would save the truck data to your backend
    alert(`Mulțumim, ${data.driverName}! Camionul tău a fost înregistrat cu succes. Vei primi oferte personalizate pe ${data.phone}.`);
  };
  
  const handleSkipRegistration = () => {
    setShowRegistration(false);
  };

  const ContactButton = ({ offer }: { offer: CargoOffer }) => {
    const handleCall = () => {
      // For demo purposes, show a simulated call interface
      if (confirm(`Vrei să suni pentru oferta \"${offer.title}\"?\n\nExpeditor: ${offer.companyName}\nTelefon: +40 722 123 456\n\nApăsă OK pentru a iniția apelul.`)) {
        // In a real app, this would make an actual call or show real contact info
        alert('Apelul a fost inițiat! Vei fi contactat de expeditor.');
      }
    };
    
    const handleMessage = async () => {
      if (!session) {
        // For non-authenticated users, show a simple form
        const driverName = prompt('Numele tău complet:');
        if (!driverName) return;
        
        const driverPhone = prompt('Numărul tău de telefon:');
        if (!driverPhone) return;
        
        try {
          const response = await fetch(`/api/marketplace/cargo/${offer.id}/contact`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              driverName,
              driverPhone,
              message: `Salut! Sunt interesat de oferta \"${offer.title}\" de la ${offer.fromCity} la ${offer.toCity}. Poți să-mi dai mai multe detalii?`
            })
          });
          
          if (response.ok) {
            const result = await response.json();
            alert(result.message);
          } else {
            alert('Nu s-a putut trimite mesajul. Te rugăm să suni direct.');
          }
        } catch (error) {
          console.error('Error sending message:', error);
          alert('Eroare la trimiterea mesajului. Te rugăm să suni direct.');
        }
      } else {
        // For authenticated users, use the chat API
        try {
          const response = await fetch(`/api/marketplace/cargo/${offer.id}/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: `Salut! Sunt interesat de oferta \"${offer.title}\" de la ${offer.fromCity} la ${offer.toCity}. Poți să-mi dai mai multe detalii?`
            })
          });
          
          if (response.ok) {
            alert('Mesajul a fost trimis! Expeditorul te va contacta în curând.');
          } else {
            alert('Nu s-a putut trimite mesajul. Te rugăm să încerci din nou.');
          }
        } catch (error) {
          console.error('Error sending message:', error);
          alert('Eroare la trimiterea mesajului. Te rugăm să suni direct.');
        }
      }
    };
    
    return (
      <div className="flex gap-2">
        <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleCall}>
          <Phone className="w-4 h-4 mr-1" />
          Sună acum
        </Button>
        <Button size="sm" variant="outline" className="flex-1" onClick={handleMessage}>
          <MessageSquare className="w-4 h-4 mr-1" />
          Mesaj
        </Button>
      </div>
    );
  };

  const ProfitCalculator = ({ offer }: { offer: CargoOffer }) => {
    const { profit, margin } = calculateProfit(offer);
    
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-800">Profitul tău estimat</span>
            <Calculator className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-700">€{profit}</div>
          <div className="text-sm text-green-600">Marjă: {margin.toFixed(1)}%</div>
          <div className="mt-2 text-xs text-green-700">
            <div>Preț: €{offer.price}</div>
            <div>Combustibil: -€{offer.fuelCost}</div>
            <div>Alte costuri: -€200</div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Truck className="w-16 h-16 mx-auto text-blue-600 animate-pulse mb-4" />
          <p className="text-xl text-gray-700">Căutăm cele mai bune oferte pentru camionul tău...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        
        {/* Hero Section - Simple and Direct */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <Truck className="w-12 h-12 text-blue-600 mr-4" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Găsește marfă pentru camionul tău
              </h1>
              <p className="text-xl text-gray-600 mt-2">
                Oferte de transport • Contact direct • Plată garantată
              </p>
            </div>
          </div>
          
          {session ? (
            <div className="bg-green-100 border border-green-300 rounded-lg p-4 inline-block">
              <p className="text-green-800">
                👋 Bună, <strong>{session.user?.name}</strong>! Am găsit {cargoOffers.length} oferte pentru tine astăzi.
              </p>
            </div>
          ) : (
            <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 inline-block">
              <p className="text-blue-800">
                💡 <Link href="/auth/signin" className="font-semibold underline">Conectează-te</Link> pentru oferte personalizate și contact direct cu expeditorii.
              </p>
              <div className="mt-2">
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => setShowRegistration(true)}
                >
                  <Truck className="w-4 h-4 mr-2" />
                  Înregistrează-ți camionul GRATUIT
                </Button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Quick Search - Simple */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">De unde</label>
                  <Input 
                    placeholder="București, Cluj..." 
                    value={searchFrom}
                    onChange={(e) => setSearchFrom(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Încotro</label>
                  <Input 
                    placeholder="Berlin, Milano..." 
                    value={searchTo}
                    onChange={(e) => setSearchTo(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Max greutate</label>
                  <Select value={maxWeight} onValueChange={setMaxWeight}>
                    <SelectTrigger>
                      <SelectValue placeholder="Orice" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Orice greutate</SelectItem>
                      <SelectItem value="10000">până la 10 tone</SelectItem>
                      <SelectItem value="15000">până la 15 tone</SelectItem>
                      <SelectItem value="20000">până la 20 tone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleSearch}>
                    <Search className="w-4 h-4 mr-2" />
                    Caută oferte
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Cargo Offers - Clean and focused on profit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Oferte disponibile ({cargoOffers.length})
            </h2>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtrează
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {cargoOffers.map((offer, index) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{offer.title}</CardTitle>
                      <Badge className={getUrgencyColor(offer.urgency)}>
                        {offer.urgency === 'high' ? 'URGENT' : 
                         offer.urgency === 'medium' ? 'NORMAL' : 'RELAXAT'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center text-blue-600 font-medium">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{offer.fromCity}</span>
                      <ArrowRight className="w-4 h-4 mx-2" />
                      <span>{offer.toCity}</span>
                      <span className="ml-2 text-gray-500">({offer.distance} km)</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Key Info Row */}
                    <div className="grid grid-cols-3 gap-4 text-center bg-gray-50 rounded-lg p-3">
                      <div>
                        <div className="flex items-center justify-center mb-1">
                          <Weight className="w-4 h-4 text-gray-600 mr-1" />
                        </div>
                        <div className="font-bold text-gray-900">{(offer.weight / 1000).toFixed(1)}t</div>
                        <div className="text-xs text-gray-600">Greutate</div>
                      </div>
                      <div>
                        <div className="flex items-center justify-center mb-1">
                          <Euro className="w-4 h-4 text-green-600 mr-1" />
                        </div>
                        <div className="font-bold text-green-600 text-xl">€{offer.price}</div>
                        <div className="text-xs text-gray-600">Preț transport</div>
                      </div>
                      <div>
                        <div className="flex items-center justify-center mb-1">
                          <Clock className="w-4 h-4 text-blue-600 mr-1" />
                        </div>
                        <div className="font-bold text-blue-600">
                          {Math.ceil(offer.distance / 500)} zile
                        </div>
                        <div className="text-xs text-gray-600">Timp estimat</div>
                      </div>
                    </div>

                    {/* Profit Calculator */}
                    <ProfitCalculator offer={offer} />

                    {/* Company Info */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{offer.companyName}</div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          <span className="text-sm text-gray-600">
                            {offer.companyRating?.toFixed(1)} • Evaluare: Excelent
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Încărcare</div>
                        <div className="font-medium">{new Date(offer.loadingDate).toLocaleDateString('ro-RO')}</div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {session ? (
                      <ContactButton offer={offer} />
                    ) : (
                      <Link href="/auth/signin">
                        <Button className="w-full bg-green-600 hover:bg-green-700">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Conectează-te pentru a aplica
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Quick Stats */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">€3,650</div>
                  <div className="text-sm text-blue-800">Profit potențial săptămânal</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">2-3</div>
                  <div className="text-sm text-green-800">Transporturi pe săptămână</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">1,200km</div>
                  <div className="text-sm text-purple-800">Distanță medie per cursă</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">68%</div>
                  <div className="text-sm text-orange-800">Marjă de profit medie</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA for Registration */}
          {!session && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold text-green-800 mb-2">
                  Vrei să câștigi mai mult cu camionul tău?
                </h3>
                <p className="text-green-700 mb-4">
                  Înregistrează-te gratuit și primește oferte personalizate direct pe telefon!
                </p>
                <Link href="/auth/signin">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700">
                    <Truck className="w-5 h-5 mr-2" />
                    Înregistrează-te GRATUIT acum
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
      
      {/* Truck Registration Modal */}
      {showRegistration && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
            <SimpleTruckRegistration 
              onComplete={handleTruckRegistration}
              onSkip={handleSkipRegistration}
            />
          </div>
        </div>
      )}
    </div>
  );
}