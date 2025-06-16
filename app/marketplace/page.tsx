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
  Check,
  MessageSquare,
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
import { useSession } from 'next-auth/react';
import { CargoOffer } from '@prisma/client';
import { CargoOfferList } from "@/components/cargo-offer-list";
import { useChat } from '@/contexts/chat-provider';

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
  const { data: session } = useSession();
  
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
  const [activeList, setActiveList] = useState("all"); // 'all', 'my_offers', 'accepted_offers'
  const [offerToDelete, setOfferToDelete] = useState<string | null>(null);
  const [offerToEdit, setOfferToEdit] = useState<CargoOffer | null>(null);
  const [offerToAssign, setOfferToAssign] = useState<CargoOffer | null>(null);
  const [editing, setEditing] = useState(false);
  const { openChat } = useChat();

  const fetchCargoOffers = async (listType: string = 'all') => {
    setLoading(true);

    const params = new URLSearchParams();
    params.append('listType', listType);
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
    fetchCargoOffers(activeList);
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
  }, [activeList]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCargoOffers(activeList);
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
      fetchCargoOffers(activeList);
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

      fetchCargoOffers(activeList); // Refresh the list
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
      fetchCargoOffers(activeList); // Refresh the list of offers

    } catch (error) {
      console.error(error);
      toast({
        title: "Assignment Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleAcceptOffer = async (offerId: string) => {
    try {
      const response = await fetch(`/api/marketplace/cargo/${offerId}/accept`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to accept offer');
      }

      toast({
        title: "Success",
        description: "You have accepted the offer.",
        className: "bg-green-500 text-white",
      });

      // Refresh the list of offers
      fetchCargoOffers(activeList);

    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({
        title: "Error",
        description: errorMessage,
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
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "find-cargo" | "find-transport")} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
          <TabsTrigger value="find-cargo" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Find Cargo</TabsTrigger>
          <TabsTrigger value="find-transport" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Find Transport</TabsTrigger>
        </TabsList>
        <TabsContent value="find-cargo">
          <Tabs defaultValue={activeList} onValueChange={setActiveList} className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
              <TabsTrigger value="all">All Offers</TabsTrigger>
              <TabsTrigger value="my_offers">My Offers</TabsTrigger>
              <TabsTrigger value="accepted_offers">Accepted Offers</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <CargoOfferList
                  offers={cargoOffers}
                  getUrgencyColor={getUrgencyColor}
                  getPriceDisplay={getPriceDisplay}
                  handleAcceptOffer={handleAcceptOffer}
                  setChatOffer={openChat}
                  setOfferToEdit={setOfferToEdit}
                  setOfferToDelete={setOfferToDelete}
                  setOfferToAssign={(offer) => setOfferToAssign(offer as any)}
              />
            </TabsContent>
            <TabsContent value="my_offers">
              <CargoOfferList
                  offers={cargoOffers}
                  getUrgencyColor={getUrgencyColor}
                  getPriceDisplay={getPriceDisplay}
                  handleAcceptOffer={handleAcceptOffer}
                  setChatOffer={openChat}
                  setOfferToEdit={setOfferToEdit}
                  setOfferToDelete={setOfferToDelete}
                  setOfferToAssign={(offer) => setOfferToAssign(offer as any)}
              />
            </TabsContent>
            <TabsContent value="accepted_offers">
              <CargoOfferList
                  offers={cargoOffers}
                  getUrgencyColor={getUrgencyColor}
                  getPriceDisplay={getPriceDisplay}
                  handleAcceptOffer={handleAcceptOffer}
                  setChatOffer={openChat}
                  setOfferToEdit={setOfferToEdit}
                  setOfferToDelete={setOfferToDelete}
                  setOfferToAssign={(offer) => setOfferToAssign(offer as any)}
              />
            </TabsContent>
          </Tabs>
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
                  <Input name="fromCountry" value={offerToEdit.fromCountry} onChange={handleEditInputChange} placeholder="From" required className="bg-slate-700 border-slate-600"/>
                  <Input name="toCountry" value={offerToEdit.toCountry} onChange={handleEditInputChange} placeholder="To" required className="bg-slate-700 border-slate-600"/>
                </div>
                <div className="grid grid-3 gap-4">
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
