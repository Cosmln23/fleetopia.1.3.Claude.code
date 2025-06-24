'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import useMarketplaceStore from '@/lib/stores/marketplace-store';
import pollingService from '@/lib/services/polling-service';
import { AgentToggle } from '@/components/agent-toggle';
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
  ChevronUp,
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
  Bot,
  Maximize2,
  Minimize2,
  SortAsc,
  SortDesc,
  FilterX
} from 'lucide-react';
import { toast } from "sonner";
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
import { AssignOfferDialog } from '@/components/assign-offer-dialog';
import { useUser } from '@clerk/nextjs';
import { CargoOffer } from '@prisma/client';
import { CargoOfferList } from "@/components/cargo-offer-list";
import { useChat } from '@/contexts/chat-provider';
import { DispatcherPanel } from '@/components/dispatcher-panel';
import { createCargoOfferSchema } from '@/lib/validations';
import { CargoDetailModal } from '@/components/cargo-detail-modal';
import { SendOfferDialog } from '@/components/send-offer-dialog';

// ELIMINAT: TransportRequest interface - nu mai este nevoie

interface SearchFilters {
  searchQuery: string;
  country: string;
  sortBy: 'newest' | 'oldest' | 'price_high' | 'price_low' | 'weight_high' | 'weight_low' | 'distance';
  cargoType: string;
  urgency: string;
  minPrice: string;
  maxPrice: string;
}

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState<'find-cargo'>('find-cargo');
  
  // Plan awareness - currently on BASIC plan, will be dynamic later
  const userPlan = 'BASIC'; // TODO: get from user context/store

  const { user, isSignedIn } = useUser();
  
  // NEW: Expand/Collapse State - ÎNCHIS inițial pentru UI curat
  const [isMarketplaceExpanded, setIsMarketplaceExpanded] = useState(false);
  
  // NEW: Search and Filter State
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    searchQuery: '',
    country: 'all_countries',
    sortBy: 'newest',
    cargoType: 'all_types',
    urgency: 'all_urgency',
    minPrice: '',
    maxPrice: ''
  });

  // NEW: Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; // 3 per row × 5 rows

  // State for the Post Cargo form
  const [newCargo, setNewCargo] = useState({
    title: '',
    fromAddress: '',
    fromCountry: '',
    fromCity: '',
    fromPostalCode: '',
    toAddress: '',
    toCountry: '',
    toCity: '',
    toPostalCode: '',
    weight: '',
    volume: '',
    cargoType: 'General',
    loadingDate: '',
    deliveryDate: '',
    price: '',
    priceType: 'fixed',
    companyName: '',
    requirements: '',
    urgency: 'medium',
  });

  // Use centralized store instead of local state
  const {
    cargoOffers,
    isLoading: loading,
    isSubmitting: posting,
    refreshData,
    addCargoOffer,
    removeCargoOffer,
    updateCargoOffer,
    setSubmitting
  } = useMarketplaceStore();
  
  // ELIMINAT: transportRequests - nu mai este nevoie
  const [activeList, setActiveList] = useState("all"); // 'all', 'my_offers', 'accepted_offers'
  const [offerToDelete, setOfferToDelete] = useState<string | null>(null);
  const [offerToEdit, setOfferToEdit] = useState<CargoOffer | null>(null);
  const [offerToAssign, setOfferToAssign] = useState<CargoOffer | null>(null);
  const [editing, setEditing] = useState(false);
  const [isAddCargoOpen, setIsAddCargoOpen] = useState(false);
  const [selectedCargoOffer, setSelectedCargoOffer] = useState<CargoOffer | null>(null);
  const [isCargoModalOpen, setIsCargoModalOpen] = useState(false);
  const { openChat } = useChat();
  const [offerToSend, setOfferToSend] = useState<CargoOffer | null>(null);

  // NEW: Filter and Search Functions
  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setSearchFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setSearchFilters({
      searchQuery: '',
      country: 'all_countries',
      sortBy: 'newest',
      cargoType: 'all_types',
      urgency: 'all_urgency',
      minPrice: '',
      maxPrice: ''
    });
    setCurrentPage(1);
  };

  // NEW: Filter and Sort Logic
  const filteredAndSortedOffers = React.useMemo(() => {
    let filtered = [...cargoOffers];

    // Text search
    if (searchFilters.searchQuery) {
      const query = searchFilters.searchQuery.toLowerCase();
      filtered = filtered.filter(offer => 
        offer.title.toLowerCase().includes(query) ||
        offer.fromCountry.toLowerCase().includes(query) ||
        offer.toCountry.toLowerCase().includes(query) ||
        offer.fromCity.toLowerCase().includes(query) ||
        offer.toCity.toLowerCase().includes(query) ||
        offer.cargoType.toLowerCase().includes(query) ||
        offer.companyName?.toLowerCase().includes(query)
      );
    }

    // Country filter
    if (searchFilters.country && searchFilters.country !== 'all_countries') {
      filtered = filtered.filter(offer => 
        offer.fromCountry.toLowerCase().includes(searchFilters.country.toLowerCase()) ||
        offer.toCountry.toLowerCase().includes(searchFilters.country.toLowerCase())
      );
    }

    // Cargo type filter
    if (searchFilters.cargoType && searchFilters.cargoType !== 'all_types') {
      filtered = filtered.filter(offer => offer.cargoType === searchFilters.cargoType);
    }

    // Urgency filter
    if (searchFilters.urgency && searchFilters.urgency !== 'all_urgency') {
      filtered = filtered.filter(offer => offer.urgency === searchFilters.urgency);
    }

    // Price range filter
    if (searchFilters.minPrice) {
      filtered = filtered.filter(offer => offer.price >= parseFloat(searchFilters.minPrice));
    }
    if (searchFilters.maxPrice) {
      filtered = filtered.filter(offer => offer.price <= parseFloat(searchFilters.maxPrice));
    }

    // Sorting
    switch (searchFilters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'weight_high':
        filtered.sort((a, b) => b.weight - a.weight);
        break;
      case 'weight_low':
        filtered.sort((a, b) => a.weight - b.weight);
        break;
      case 'distance':
        filtered.sort((a, b) => (b.distance || 0) - (a.distance || 0));
        break;
      default:
        break;
    }

    return filtered;
  }, [cargoOffers, searchFilters]);

  // NEW: Pagination Logic with useMemo to prevent re-rendering
  const { paginatedOffers, totalPages } = useMemo(() => {
    const total = Math.ceil(filteredAndSortedOffers.length / itemsPerPage);
    const paginated = filteredAndSortedOffers.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
    return { paginatedOffers: paginated, totalPages: total };
  }, [filteredAndSortedOffers, currentPage, itemsPerPage]);

  // Memoized cargo offers for other tabs to prevent re-rendering
  const memoizedCargoOffers = useMemo(() => cargoOffers, [cargoOffers]);

  // REPLACED: fetchCargoOffers now uses centralized store
  const fetchCargoOffers = async (listType: string = 'all') => {
    // Don't fetch protected lists if user is not authenticated
    if ((listType === 'my_offers' || listType === 'accepted_offers') && !isSignedIn) {
      return;
    }

    await refreshData(listType);
  };

  // ELIMINAT: fetchTransportRequests function - nu mai este nevoie

  useEffect(() => {
    fetchCargoOffers(activeList);
  }, [activeList]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCargo(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewCargo(prev => ({ ...prev, [name]: value }));
  };

  const handlePostCargo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      toast.error("Please sign in to post cargo offers.");
      return;
    }

    try {
      setSubmitting(true);

      // Validate form data
      const formData = {
        ...newCargo,
        weight: parseFloat(newCargo.weight),
        volume: newCargo.volume ? parseFloat(newCargo.volume) : undefined,
        price: parseFloat(newCargo.price),
        loadingDate: new Date(newCargo.loadingDate),
        deliveryDate: new Date(newCargo.deliveryDate),
        requirements: newCargo.requirements.split(',').map(req => req.trim()).filter(Boolean),
      };

      const validation = createCargoOfferSchema.safeParse(formData);
      if (!validation.success) {
        toast.error(`Validation Error: ${validation.error.errors.map(e => e.message).join(', ')}`);
        return;
      }

      const response = await fetch('/api/marketplace/cargo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validation.data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Failed to create cargo offer');
      }

      // Add to store for immediate UI update
      addCargoOffer(result.data);

      toast.success("📦 Your cargo offer has been posted successfully!");

      // Reset form
      setNewCargo({
        title: '',
        fromAddress: '',
        fromCountry: '',
        fromCity: '',
        fromPostalCode: '',
        toAddress: '',
        toCountry: '',
        toCity: '',
        toPostalCode: '',
        weight: '',
        volume: '',
        cargoType: 'General',
        loadingDate: '',
        deliveryDate: '',
        price: '',
        priceType: 'fixed',
        companyName: '',
        requirements: '',
        urgency: 'medium',
      });

      setIsAddCargoOpen(false);

    } catch (error) {
      console.error('Error posting cargo:', error);
      toast.error(error instanceof Error ? error.message : "Failed to post cargo offer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCargo = async () => {
    if (!offerToDelete) return;

    try {
      console.log('FRONTEND: Starting delete process for:', offerToDelete);
      
      const response = await fetch(`/api/marketplace/cargo/${offerToDelete}`, {
        method: 'DELETE',
      });

      console.log('FRONTEND: Delete response status:', response.status);
      
      if (response.status === 204) {
        // Successfully deleted
        console.log('FRONTEND: Delete successful');
        
        // Remove from store
        removeCargoOffer(offerToDelete);
        
        toast.success("✅ Cargo offer has been deleted.");
      } else {
        // Handle error
        const errorData = await response.json();
        console.error('FRONTEND: Delete failed:', errorData);
        throw new Error(errorData.message || 'Failed to delete cargo offer');
      }
    } catch (error) {
      console.error('FRONTEND: Delete error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(errorMessage);
    } finally {
      setOfferToDelete(null);
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!offerToEdit) return;
    const { name, value } = e.target;
    setOfferToEdit({ ...offerToEdit, [name]: value });
  };

  const handleUpdateCargo = async () => {
    if (!offerToEdit) return;

    try {
      const response = await fetch(`/api/marketplace/cargo/${offerToEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offerToEdit),
      });

      if (!response.ok) {
        throw new Error('Failed to update cargo offer');
      }

      const updatedOffer = await response.json();
      updateCargoOffer(offerToEdit.id, updatedOffer);

      toast.success("✅ Cargo offer has been updated.");

      setOfferToEdit(null);
      setEditing(false);
    } catch (error) {
      toast.error("Failed to update cargo offer.");
    }
  };

  const getPriceDisplay = (offer: CargoOffer) => {
    if (offer.priceType === 'negotiable') {
      return `€${offer.price.toLocaleString()} (Negotiable)`;
    } else if (offer.priceType === 'per_km') {
      return `€${offer.price}/km`;
    } else {
      return `€${offer.price.toLocaleString()}`;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const handleAssignOffer = async (vehicleId: string) => {
    if (!offerToAssign) return;

    try {
      const response = await fetch('/api/assignments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cargoOfferId: offerToAssign.id,
          vehicleId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to assign offer');
      }

      const assignment = await response.json();

      // Plan-aware notification
      if (userPlan === 'PRO') {
        toast.success("🤖 Agent AI: Offer assigned successfully!");
      } else {
        toast.success("✅ Offer assigned successfully!");
      }

      setOfferToAssign(null);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Assignment failed';
      toast.error(errorMessage);
    }
  };

  const handleOpenCargoModal = (offer: any) => {
    setSelectedCargoOffer(offer);
    setIsCargoModalOpen(true);
  };

  const handleCloseCargoModal = () => {
    setSelectedCargoOffer(null);
    setIsCargoModalOpen(false);
  };

  const handleOpenSendOfferDialog = (offer: CargoOffer) => {
    setOfferToSend(offer);
  };

  const handleAcceptOffer = async (offerId: string) => {
    if (!isSignedIn) {
      toast.error('You must be logged in to accept offers.');
      return;
    }

    try {
      const response = await fetch(`/api/marketplace/cargo/${offerId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to accept offer');
      }

      toast.success("🚛 Offer Accepted! You can now chat with the cargo owner.");

      // Refresh cargo offers to reflect changes
      await refreshData(activeList);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(errorMessage);
    }
  };

  const handleOwnerAcceptOffer = async (offerId: string) => {
    if (!isSignedIn) {
      toast.error('You must be logged in.');
      return;
    }

    try {
      const response = await fetch(`/api/marketplace/cargo/${offerId}/owner-accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to accept offer');
      }

      toast.success("✅ Offer accepted! Transport can begin.");

      await refreshData(activeList);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(errorMessage);
    }
  };

  const handleRepostOffer = async (offerId: string) => {
    if (!isSignedIn) {
      toast.error('You must be logged in.');
      return;
    }

    try {
      const response = await fetch(`/api/marketplace/cargo/${offerId}/repost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to repost offer');
      }

      toast.success("📦 Offer reposted successfully!");

      await refreshData(activeList);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(errorMessage);
    }
  };

  const handleMarkDelivered = async (offerId: string) => {
    if (!isSignedIn) {
      toast.error('You must be logged in.');
      return;
    }

    try {
      const response = await fetch(`/api/marketplace/cargo/${offerId}/deliver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to mark as delivered');
      }

      // Plan-aware notification
      if (userPlan === 'PRO') {
        toast.success("🎯 Agent AI: Delivery confirmed! Payment processing initiated.");
      } else {
        toast.success("🚚 Delivery confirmed! Thank you for using Fleetopia.");
      }

      await refreshData(activeList);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(errorMessage);
    }
  };

  const handleSendOffer = async (offerId: string, price: number) => {
    if (!isSignedIn) {
      toast.error('You must be logged in to send an offer.');
      return;
    }

    try {
      const response = await fetch(`/api/marketplace/cargo/${offerId}/offer-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send offer');
      }

      toast.success(`💰 Offer Sent! Your offer of €${price} has been sent. You can now chat with the owner.`);

      setOfferToSend(null);
      await refreshData(activeList);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(errorMessage);
    }
  };

  // Initialize data fetching on component mount and tab changes
  useEffect(() => {
    fetchCargoOffers(activeList);
  }, [activeList]);

  // ELIMINAT: useEffect pentru find-transport - nu mai este nevoie

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
      {/* Add Cargo Button - Independent și deasupra secțiunii */}
      <div className="mb-4 flex justify-end">
        <Button 
          onClick={() => setIsAddCargoOpen(true)} 
          className="bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Cargo
        </Button>
      </div>

      {/* NEW: Expandable/Collapsible Marketplace Header */}
      <Collapsible 
        open={isMarketplaceExpanded} 
        onOpenChange={setIsMarketplaceExpanded}
        className="mb-6"
      >
        <div className="border-2 border-red-500/50 rounded-lg bg-slate-900/50 backdrop-blur-sm">
          <CollapsibleTrigger asChild>
            <Card className="bg-[--card] border-none cursor-pointer hover:bg-slate-800/30 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center space-x-3">
                      <Truck className="h-8 w-8 text-blue-400" />
                      <div>
                        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Logistics Marketplace</h1>
                        <p className="mt-2 text-lg text-blue-200">The central hub for finding cargo and available transport.</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Button variant="ghost" size="icon">
                      {isMarketplaceExpanded ? 
                        <ChevronUp className="h-5 w-5" /> : 
                        <ChevronDown className="h-5 w-5" />
                      }
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-4 p-6">
            {/* Fleet Dispatcher AI */}
            <DispatcherPanel />
            
            {/* Agent AI Toggle */}
            <AgentToggle />
            
            <Separator className="bg-slate-700" />
          </CollapsibleContent>
        </div>
      </Collapsible>
      
      {/* Simplificat - doar secțiunea Find Cargo */}
      <div className="w-full">
        <Tabs defaultValue={activeList} onValueChange={setActiveList} className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
            <TabsTrigger value="all">All Offers</TabsTrigger>
            <TabsTrigger value="my_offers">My Offers</TabsTrigger>
            <TabsTrigger value="accepted_offers">Accepted Offers</TabsTrigger>
          </TabsList>

            {/* Advanced Search and Filter System - Moved outside collapse */}
            <Card className="bg-[--card] mt-4 wave-hover">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5 text-blue-400" />
                  <span>Advanced Search & Filter</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search Bar */}
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <Input
                      placeholder="Search cargo offers (title, country, city, company...)"
                      value={searchFilters.searchQuery}
                      onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={clearFilters}
                    className="flex items-center space-x-2"
                  >
                    <FilterX className="h-4 w-4" />
                    <span>Clear</span>
                  </Button>
                </div>

                {/* Filter Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                  <Select value={searchFilters.country} onValueChange={(value) => handleFilterChange('country', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_countries">All Countries</SelectItem>
                      {europeanCountries.map(country => (
                        <SelectItem key={country.code} value={country.name}>{country.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={searchFilters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">🕒 Newest First</SelectItem>
                      <SelectItem value="oldest">⏰ Oldest First</SelectItem>
                      <SelectItem value="price_high">💰 Highest Price</SelectItem>
                      <SelectItem value="price_low">💸 Lowest Price</SelectItem>
                      <SelectItem value="weight_high">⚖️ Heaviest</SelectItem>
                      <SelectItem value="weight_low">🪶 Lightest</SelectItem>
                      <SelectItem value="distance">📏 By Distance</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={searchFilters.cargoType} onValueChange={(value) => handleFilterChange('cargoType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Cargo Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_types">All Types</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Food">Food</SelectItem>
                      <SelectItem value="Hazardous">Hazardous</SelectItem>
                      <SelectItem value="Refrigerated">Refrigerated</SelectItem>
                      <SelectItem value="Fragile">Fragile</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={searchFilters.urgency} onValueChange={(value) => handleFilterChange('urgency', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_urgency">All Urgency</SelectItem>
                      <SelectItem value="low">🟢 Low</SelectItem>
                      <SelectItem value="medium">🟡 Medium</SelectItem>
                      <SelectItem value="high">🔴 High</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Min Price (€)"
                    type="number"
                    value={searchFilters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  />

                  <Input
                    placeholder="Max Price (€)"
                    type="number"
                    value={searchFilters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  />
                </div>

                {/* Results Summary */}
                <div className="flex justify-between items-center text-sm text-slate-300">
                  <div>
                    Showing {paginatedOffers.length} of {filteredAndSortedOffers.length} cargo offers
                  </div>
                  <div className="flex items-center space-x-4">
                    <span>Page {currentPage} of {totalPages}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <TabsContent value="all">
              {/* NEW: Enhanced CargoOfferList with Pagination */}
              <CargoOfferList
                  offers={paginatedOffers}
                  getUrgencyColor={getUrgencyColor}
                  getPriceDisplay={getPriceDisplay}
                  handleAcceptOffer={handleAcceptOffer}
                  handleOwnerAcceptOffer={handleOwnerAcceptOffer}
                  handleRepostOffer={handleRepostOffer}
                  handleMarkDelivered={handleMarkDelivered}
                  setChatOffer={openChat}
                  setOfferToEdit={setOfferToEdit}
                  setOfferToDelete={setOfferToDelete}
                  setOfferToAssign={(offer) => setOfferToAssign(offer as any)}
                  onCardClick={handleOpenCargoModal}
                  handleOpenSendOfferDialog={handleOpenSendOfferDialog}
              />

              {/* NEW: Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => setCurrentPage(page)}
                        className={currentPage === page ? "bg-blue-600" : ""}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </TabsContent>
            <TabsContent value="my_offers">
              <CargoOfferList
                  offers={memoizedCargoOffers}
                  listType="my_offers"
                  getUrgencyColor={getUrgencyColor}
                  getPriceDisplay={getPriceDisplay}
                  handleAcceptOffer={handleAcceptOffer}
                  handleOwnerAcceptOffer={handleOwnerAcceptOffer}
                  handleRepostOffer={handleRepostOffer}
                  handleMarkDelivered={handleMarkDelivered}
                  setChatOffer={openChat}
                  setOfferToEdit={setOfferToEdit}
                  setOfferToDelete={setOfferToDelete}
                  setOfferToAssign={(offer) => setOfferToAssign(offer as any)}
                  onCardClick={handleOpenCargoModal}
                  handleOpenSendOfferDialog={handleOpenSendOfferDialog}
              />
            </TabsContent>
            <TabsContent value="accepted_offers">
              <CargoOfferList
                  offers={memoizedCargoOffers}
                  listType="accepted_offers"
                  getUrgencyColor={getUrgencyColor}
                  getPriceDisplay={getPriceDisplay}
                  handleAcceptOffer={handleAcceptOffer}
                  handleOwnerAcceptOffer={handleOwnerAcceptOffer}
                  handleRepostOffer={handleRepostOffer}
                  handleMarkDelivered={handleMarkDelivered}
                  setChatOffer={openChat}
                  setOfferToEdit={setOfferToEdit}
                  setOfferToDelete={setOfferToDelete}
                  setOfferToAssign={(offer) => setOfferToAssign(offer as any)}
                  onCardClick={handleOpenCargoModal}
                  handleOpenSendOfferDialog={handleOpenSendOfferDialog}
              />
            </TabsContent>
          </Tabs>
        </div>

      {/* Edit Dialog */}
      <Dialog open={!!offerToEdit} onOpenChange={() => setOfferToEdit(null)}>
        <DialogContent className="sm:max-w-[625px] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Edit Cargo Offer</DialogTitle>
            <DialogDescription>
              Make changes to your cargo offer here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {offerToEdit && (
            <form onSubmit={handleUpdateCargo} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                   <Input name="title" value={offerToEdit.title} onChange={handleEditInputChange} placeholder="Offer Title" required />
                   <Input name="companyName" value={offerToEdit.companyName || ''} onChange={handleEditInputChange} placeholder="Company Name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input name="fromCountry" value={offerToEdit.fromCountry} onChange={handleEditInputChange} placeholder="From" required />
                  <Input name="toCountry" value={offerToEdit.toCountry} onChange={handleEditInputChange} placeholder="To" required />
                </div>
                <div className="grid grid-3 gap-4">
                  <Input name="weight" type="number" value={offerToEdit.weight} onChange={handleEditInputChange} placeholder="Weight (kg)" required />
                  <Input name="price" type="number" value={offerToEdit.price} onChange={handleEditInputChange} placeholder="Price (€)" required />
                  <select name="urgency" value={offerToEdit.urgency} onChange={handleEditInputChange} className="rounded-md p-2 w-full">
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
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!offerToDelete} onOpenChange={() => setOfferToDelete(null)}>
        <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Delete Cargo Offer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this cargo offer? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setOfferToDelete(null)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteCargo}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Add Cargo Dialog */}
      <Dialog open={isAddCargoOpen} onOpenChange={setIsAddCargoOpen}>
        <DialogContent className="sm:max-w-[550px] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 border-slate-700 text-white">
            <DialogHeader>
                <DialogTitle>Post a New Cargo Offer</DialogTitle>
                <DialogDescription>
                Fill in the details below to publish a new transport opportunity.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handlePostCargo}>
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                <div className="grid grid-cols-2 gap-4">
                    <Input name="title" placeholder="Offer Title (e.g., Furniture Warsaw - Berlin)" value={newCargo.title} onChange={handleInputChange} className="text-white" />
                    <Input name="companyName" placeholder="Company Name" value={newCargo.companyName} onChange={handleInputChange} className="text-white" />
                </div>
                                  <Textarea name="requirements" placeholder="Special requirements (e.g., hydraulic lift, controlled temperature)" value={newCargo.requirements} onChange={handleInputChange} className="text-white"/>
                <div className="grid grid-cols-2 gap-4">
                    <Select name="fromCountry" onValueChange={(value) => handleSelectChange('fromCountry', value)}>
                        <SelectTrigger className="text-white">
                            <SelectValue placeholder="Origin Country" />
                        </SelectTrigger>
                        <SelectContent>
                            {europeanCountries.map(c => <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                     <Select name="toCountry" onValueChange={(value) => handleSelectChange('toCountry', value)}>
                        <SelectTrigger className="text-white">
                            <SelectValue placeholder="Destination Country" />
                        </SelectTrigger>
                        <SelectContent>
                            {europeanCountries.map(c => <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <Input name="fromCity" placeholder="Origin City" value={newCargo.fromCity} onChange={handleInputChange} className="text-white" />
                    <Input name="toCity" placeholder="Destination City" value={newCargo.toCity} onChange={handleInputChange} className="text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Input name="fromAddress" placeholder="Origin Address" value={newCargo.fromAddress} onChange={handleInputChange} className="text-white" />
                    <Input name="toAddress" placeholder="Destination Address" value={newCargo.toAddress} onChange={handleInputChange} className="text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Input name="fromPostalCode" placeholder="Origin Postal Code" value={newCargo.fromPostalCode} onChange={handleInputChange} className="text-white" />
                    <Input name="toPostalCode" placeholder="Destination Postal Code" value={newCargo.toPostalCode} onChange={handleInputChange} className="text-white" />
                </div>
                <div className="grid grid-3 gap-4">
                    <Input name="weight" type="number" placeholder="Weight (kg)" value={newCargo.weight} onChange={handleInputChange} className="text-white" />
                    <Input name="volume" type="number" placeholder="Volume (m³)" value={newCargo.volume} onChange={handleInputChange} className="text-white" />
                    <Input name="cargoType" placeholder="Cargo Type" value={newCargo.cargoType} onChange={handleInputChange} className="text-white" />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="loadingDate" className="text-sm font-medium text-slate-300">Loading Date</label>
                        <Input 
                          id="loadingDate" 
                          name="loadingDate" 
                          type="date" 
                          value={newCargo.loadingDate} 
                          onChange={handleInputChange}
                          className="text-white"
                          required
                        />
                    </div>
                     <div>
                        <label htmlFor="deliveryDate" className="text-sm font-medium text-slate-300">Delivery Date</label>
                        <Input 
                          id="deliveryDate" 
                          name="deliveryDate" 
                          type="date" 
                          value={newCargo.deliveryDate} 
                          onChange={handleInputChange}
                          className="text-white"
                          required
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Input name="price" type="number" placeholder="Price" value={newCargo.price} onChange={handleInputChange} className="text-white" />
                    <Select name="urgency" defaultValue="medium" onValueChange={(value) => handleSelectChange('urgency', value)}>
                        <SelectTrigger className="text-white">
                            <SelectValue placeholder="Urgency" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddCargoOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={posting}>
                    {posting ? 'Posting...' : 'Post Offer'}
                </Button>
            </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>

    {/* Cargo Detail Modal */}
    <CargoDetailModal
      isOpen={isCargoModalOpen}
      onClose={handleCloseCargoModal}
      cargoOffer={selectedCargoOffer}
      onSendOffer={handleOpenSendOfferDialog}
    />

    {/* Render the new Send Offer Dialog */}
    <SendOfferDialog
      isOpen={!!offerToSend}
      onClose={() => setOfferToSend(null)}
      offer={offerToSend}
      onSubmit={handleSendOffer}
    />
    </div>
  );
}
