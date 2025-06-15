'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
  Plus,
  Trash2,
  FileEdit,
  Hand,
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { europeanCountries } from '@/lib/countries';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AssignOfferDialog } from '@/components/assign-offer-dialog';

interface CargoOffer {
  id: string;
  title: string;
  fromLocation: string;
  toLocation: string;
  distance: number | null;
  weight: number;
  volume: number | null;
  cargoType: string;
  loadingDate: string;
  deliveryDate: string;
  price: number;
  priceType: string;
  companyName: string;
  companyRating: number | null;
  requirements: string[];
  truckType: string | null;
  status: string;
  urgency: string;
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
  const { toast } = useToast();
  
  const [searchFilters, setSearchFilters] = useState({
    fromLocation: '',
    toLocation: '',
    maxWeight: '',
  });

  // State for the Post Cargo form
  const [newCargo, setNewCargo] = useState({
    title: '',
    fromAddress: '',
    fromCountry: '',
    fromPostalCode: '',
    toAddress: '',
    toCountry: '',
    toPostalCode: '',
    weight: '',
    volume: '',
    cargoType: '',
    loadingDate: '',
    deliveryDate: '',
    price: '',
    priceType: 'fixed',
    companyName: '',
    requirements: '',
    urgency: 'medium',
  });

  const [cargoOffers, setCargoOffers] = useState<CargoOffer[]>([]);
  const [transportRequests, setTransportRequests] = useState<TransportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<string | null>(null);
  const [offerToEdit, setOfferToEdit] = useState<CargoOffer | null>(null);
  const [offerToAssign, setOfferToAssign] = useState<CargoOffer | null>(null);
  const [editing, setEditing] = useState(false);

  const fetchCargoOffers = async () => {
    setLoading(true);

    const params = new URLSearchParams();
    if (searchFilters.fromLocation) params.append('fromLocation', searchFilters.fromLocation);
    if (searchFilters.toLocation) params.append('toLocation', searchFilters.toLocation);
    if (searchFilters.maxWeight) params.append('maxWeight', searchFilters.maxWeight);
    
    const queryString = params.toString();

    try {
      const response = await fetch(`/api/marketplace/cargo?${queryString}`);
      if (!response.ok) {
        throw new Error('Failed to fetch cargo offers');
      }
      const data = await response.json();
      setCargoOffers(data);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Could not fetch cargo offers.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCargoOffers();
    // Transport requests still use mock data for now
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
    setTransportRequests(mockTransportRequests);
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCargoOffers();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCargo(prev => ({ ...prev, [name]: value }));
  };

  const handlePostCargo = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosting(true);

    const postData = {
        ...newCargo,
        requirements: newCargo.requirements.split(',').map(req => req.trim()).filter(Boolean),
    };

    try {
      const response = await fetch('/api/marketplace/cargo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to post cargo');
      }

      toast({
        title: "Success!",
        description: "Your cargo offer has been posted.",
        className: "bg-green-500 text-white",
      });
      
      // Reset form and refetch offers
      setNewCargo({
        title: '', fromAddress: '', fromCountry: '', fromPostalCode: '', toAddress: '', toCountry: '', toPostalCode: '', weight: '', volume: '', cargoType: '',
        loadingDate: '', deliveryDate: '', price: '', priceType: 'fixed',
        companyName: '', requirements: '', urgency: 'medium',
      });
      fetchCargoOffers();
      setActiveTab('find-cargo');

    } catch (error) {
      console.error(error);
      toast({
        title: "Error Posting Cargo",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteCargo = async () => {
    if (!offerToDelete) return;

    try {
      const response = await fetch(`/api/marketplace/cargo/${offerToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete cargo offer');
      }
      
      toast({
        title: "Success",
        description: "Cargo offer has been deleted.",
      });

      fetchCargoOffers(); // Refresh the list
    } catch (error) {
       console.error(error);
       toast({
        title: "Error",
        description: "Could not delete the cargo offer.",
        variant: "destructive",
      });
    } finally {
      setOfferToDelete(null); // Close the dialog
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!offerToEdit) return;
    const { name, value } = e.target;
    setOfferToEdit({ ...offerToEdit, [name]: value });
  };

  const handleUpdateCargo = async () => {
    if (!offerToEdit) return;
    // Logic to be implemented in the next step
    console.log("Updating cargo:", offerToEdit);
    setOfferToEdit(null);
  };

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

  const handleAssignOffer = async (vehicleId: string) => {
    if (!offerToAssign) return;

    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cargoOfferId: offerToAssign.id,
          vehicleId: vehicleId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to assign the offer.');
      }

      toast({
        title: "Success!",
        description: `Offer "${offerToAssign.title}" has been assigned.`,
        className: "bg-green-500 text-white",
      });

      setOfferToAssign(null); // Close the dialog
      fetchCargoOffers(); // Refresh the list of offers

    } catch (error) {
      console.error(error);
      toast({
        title: "Assignment Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
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
        <AlertDialog open={!!offerToDelete} onOpenChange={() => setOfferToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the cargo offer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteCargo} className="bg-red-600 hover:bg-red-700">Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <AlertDialog open={!!offerToEdit} onOpenChange={() => setOfferToEdit(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the cargo offer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => setOfferToEdit(null)} className="bg-red-600 hover:bg-red-700">Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <TabsContent value="post-cargo" className="mt-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Post a New Cargo Offer</CardTitle>
              <CardDescription>Fill in the details below to find a suitable carrier.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handlePostCargo} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium text-slate-300">Cargo Title</label>
                    <Input id="title" name="title" placeholder="e.g., Electronics from Berlin to Frankfurt" required value={newCargo.title} onChange={handleInputChange} className="bg-slate-800 border-slate-600" />
                  </div>
                   <div className="space-y-2">
                    <label htmlFor="companyName" className="text-sm font-medium text-slate-300">Company Name (Optional)</label>
                    <Input id="companyName" name="companyName" placeholder="Your Company Inc." value={newCargo.companyName} onChange={handleInputChange} className="bg-slate-800 border-slate-600" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="fromCountry" className="text-sm font-medium text-slate-300">From Country</label>
                    <Select name="fromCountry" required onValueChange={(value) => handleInputChange({ target: { name: 'fromCountry', value } } as any)}>
                        <SelectTrigger className="bg-slate-800 border-slate-600">
                            <SelectValue placeholder="Select a country" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600 text-white">
                            {europeanCountries.map(country => (
                                <SelectItem key={country.code} value={country.code}>{country.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="fromAddress" className="text-sm font-medium text-slate-300">From Address & City</label>
                    <Input id="fromAddress" name="fromAddress" placeholder="e.g. Willy-Brandt-Straße 1, Berlin" required value={newCargo.fromAddress} onChange={handleInputChange} className="bg-slate-800 border-slate-600" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <label htmlFor="fromPostalCode" className="text-sm font-medium text-slate-300">From Postal Code</label>
                    <Input id="fromPostalCode" name="fromPostalCode" placeholder="e.g., 10557" value={newCargo.fromPostalCode} onChange={handleInputChange} className="bg-slate-800 border-slate-600" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="toCountry" className="text-sm font-medium text-slate-300">To Country</label>
                     <Select name="toCountry" required onValueChange={(value) => handleInputChange({ target: { name: 'toCountry', value } } as any)}>
                        <SelectTrigger className="bg-slate-800 border-slate-600">
                            <SelectValue placeholder="Select a country" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600 text-white">
                            {europeanCountries.map(country => (
                                <SelectItem key={country.code} value={country.code}>{country.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="toAddress" className="text-sm font-medium text-slate-300">To Address & City</label>
                    <Input id="toAddress" name="toAddress" placeholder="e.g. Zeil 112-114, Frankfurt" required value={newCargo.toAddress} onChange={handleInputChange} className="bg-slate-800 border-slate-600" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="toPostalCode" className="text-sm font-medium text-slate-300">To Postal Code</label>
                    <Input id="toPostalCode" name="toPostalCode" placeholder="e.g., 60311" value={newCargo.toPostalCode} onChange={handleInputChange} className="bg-slate-800 border-slate-600" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="weight" className="text-sm font-medium text-slate-300">Weight (kg)</label>
                    <Input id="weight" name="weight" type="number" required value={newCargo.weight} onChange={handleInputChange} className="bg-slate-800 border-slate-600" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="volume" className="text-sm font-medium text-slate-300">Volume (m³)</label>
                    <Input id="volume" name="volume" type="number" required value={newCargo.volume} onChange={handleInputChange} className="bg-slate-800 border-slate-600" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="cargoType" className="text-sm font-medium text-slate-300">Cargo Type</label>
                    <Input id="cargoType" name="cargoType" required value={newCargo.cargoType} onChange={handleInputChange} className="bg-slate-800 border-slate-600" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <label className="text-xs text-slate-400">Loading Date</label>
                     <Input name="loadingDate" type="date" value={newCargo.loadingDate} onChange={handleInputChange} required className="bg-slate-700 border-slate-600"/>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Delivery Date</label>
                    <Input name="deliveryDate" type="date" value={newCargo.deliveryDate} onChange={handleInputChange} required className="bg-slate-700 border-slate-600"/>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input name="price" type="number" value={newCargo.price} onChange={handleInputChange} placeholder="Price (€)" required className="bg-slate-700 border-slate-600"/>
                  <select name="priceType" value={newCargo.priceType} onChange={handleInputChange} className="bg-slate-700 border-slate-600 rounded-md p-2 w-full">
                    <option value="fixed">Fixed Price</option>
                    <option value="negotiable">Negotiable</option>
                    <option value="per_km">Per KM</option>
                  </select>
                </div>
                 <div>
                    <label className="text-xs text-slate-400">Urgency</label>
                    <select name="urgency" value={newCargo.urgency} onChange={handleInputChange} className="bg-slate-700 border-slate-600 rounded-md p-2 w-full">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                 </div>
                <Textarea name="requirements" value={newCargo.requirements} onChange={handleInputChange} placeholder="Requirements (comma-separated, e.g., Refrigerated, ADR)" className="bg-slate-700 border-slate-600"/>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={posting}>
                  {posting ? 'Posting...' : 'Post Cargo Offer'}
                </Button>
              </form>
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
              <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                <Input name="fromLocation" value={searchFilters.fromLocation} onChange={handleFilterChange} placeholder="From (e.g., Bucharest)" className="bg-slate-700 border-slate-600 text-white" />
                <Input name="toLocation" value={searchFilters.toLocation} onChange={handleFilterChange} placeholder="To (e.g., Berlin)" className="bg-slate-700 border-slate-600 text-white" />
                <Input name="maxWeight" type="number" value={searchFilters.maxWeight} onChange={handleFilterChange} placeholder="Max. Weight (kg)" className="bg-slate-700 border-slate-600 text-white" />
                <div className="bg-slate-700 border-slate-600 text-white rounded-md flex items-center px-3">
                  <Calendar className="h-4 w-4 text-slate-400 mr-2" />
                  <span>Any Date</span>
                </div>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 lg:col-span-1 xl:col-span-1 w-full">
                  <Search className="mr-2 h-4 w-4" /> Search
                </Button>
              </form>
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
                      <span className="font-semibold">{offer.fromLocation}</span>
                      <ArrowRight className="h-4 w-4 mx-2" />
                      <span className="font-semibold">{offer.toLocation}</span>
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
                        <p className="text-sm font-semibold text-slate-300">{offer.companyName}</p>
                        <div className="flex items-center text-xs text-slate-400">
                          <Star className="h-3 w-3 mr-1 text-yellow-400" /> {offer.companyRating || 'New'}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-400">{getPriceDisplay(offer)}</p>
                        <div className="flex items-center gap-2 mt-1">
                           <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 bg-green-800/70 hover:bg-green-700 border-slate-600"
                              title="Assign Offer"
                              onClick={() => setOfferToAssign(offer)}
                           >
                            <Hand className="h-4 w-4" />
                           </Button>
                           <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 bg-slate-800/70 hover:bg-slate-700 border-slate-600"
                              title="Edit Offer"
                              onClick={() => setOfferToEdit(offer)}
                           >
                            <FileEdit className="h-4 w-4" />
                           </Button>
                           <Button 
                              variant="destructive" 
                              size="icon" 
                              className="h-8 w-8 bg-red-800/70 hover:bg-red-700"
                              title="Delete Offer"
                              onClick={() => setOfferToDelete(offer.id)}
                            >
                             <Trash2 className="h-4 w-4"/>
                           </Button>
                        </div>
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
      {/* Edit Dialog */}
      <Dialog open={!!offerToEdit} onOpenChange={() => setOfferToEdit(null)}>
        <DialogContent className="sm:max-w-[625px] bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Edit Cargo Offer</DialogTitle>
            <DialogDescription>
              Make changes to your cargo offer here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {offerToEdit && (
            <form onSubmit={handleUpdateCargo} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                   <Input name="title" value={offerToEdit.title} onChange={handleEditInputChange} placeholder="Offer Title" required className="bg-slate-700 border-slate-600"/>
                   <Input name="companyName" value={offerToEdit.companyName} onChange={handleEditInputChange} placeholder="Company Name" className="bg-slate-700 border-slate-600"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input name="fromLocation" value={offerToEdit.fromLocation} onChange={handleEditInputChange} placeholder="From" required className="bg-slate-700 border-slate-600"/>
                  <Input name="toLocation" value={offerToEdit.toLocation} onChange={handleEditInputChange} placeholder="To" required className="bg-slate-700 border-slate-600"/>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Input name="weight" type="number" value={offerToEdit.weight} onChange={handleEditInputChange} placeholder="Weight (kg)" required className="bg-slate-700 border-slate-600"/>
                  <Input name="price" type="number" value={offerToEdit.price} onChange={handleEditInputChange} placeholder="Price (€)" required className="bg-slate-700 border-slate-600"/>
                  <select name="urgency" value={offerToEdit.urgency} onChange={handleEditInputChange} className="bg-slate-700 border-slate-600 rounded-md p-2 w-full">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                  </select>
                </div>
               <DialogFooter>
                  <Button type="button" variant="secondary" onClick={() => setOfferToEdit(null)}>Cancel</Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={editing}>
                    {editing ? 'Saving...' : 'Save Changes'}
                  </Button>
               </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <AssignOfferDialog
        offer={offerToAssign}
        onClose={() => setOfferToAssign(null)}
        onAssign={handleAssignOffer}
      />
    </div>
  );
}
