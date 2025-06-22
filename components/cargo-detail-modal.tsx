'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  X,
  MapPin,
  Calendar,
  Weight,
  Package,
  Euro,
  Truck,
  Clock,
  Star,
  Building,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Navigation,
  Shield
} from 'lucide-react';
import { CargoOffer } from '@prisma/client';
import { useUser } from '@clerk/nextjs';
import { useChat } from '@/contexts/chat-provider';

interface CargoDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  cargoOffer: CargoOffer | null;
  onSendOffer: (offer: CargoOffer) => void;
}

export function CargoDetailModal({ isOpen, onClose, cargoOffer, onSendOffer }: CargoDetailModalProps) {
  const { user } = useUser();
  const { openChat } = useChat();

  if (!cargoOffer) return null;

  const isOwnOffer = cargoOffer.userId === user?.id;
  const isAccepted = cargoOffer.status === 'TAKEN';

  const handleChatClick = () => {
    if (!isOwnOffer) {
      // Deschidem chat-ul prin useChat cu cargoOffer-ul complet
      openChat(cargoOffer);
      // Închidem modal-ul pentru a evita conflictele
      onClose();
    }
  };

  const handleAcceptOffer = async () => {
    try {
      const response = await fetch(`/api/marketplace/cargo/${cargoOffer.id}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Handle success - refresh data or update UI
        onClose();
      }
    } catch (error) {
      console.error('Error accepting offer:', error);
    }
  };

  const formatDate = (date: Date | string) => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] p-0 overflow-hidden bg-slate-900 border-slate-700">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <Package className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-white">
                    {cargoOffer.title}
                  </DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Complete details about cargo transport
                  </DialogDescription>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant={getUrgencyColor(cargoOffer.urgency)} className="flex items-center space-x-1">
                      {getUrgencyIcon(cargoOffer.urgency)}
                      <span className="capitalize">{cargoOffer.urgency}</span>
                    </Badge>
                    <Badge variant={isAccepted ? 'default' : 'secondary'}>
                      {isAccepted ? 'Accepted' : 'Available'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Main Content */}
          <div className="flex h-[calc(95vh-120px)]">
            {/* Left Side - Cargo Details */}
            <div className="flex-1 overflow-y-auto bg-slate-900">
              <div className="p-6 space-y-6">
                {/* Route Information */}
                <Card className="bg-slate-800/70 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <Navigation className="h-5 w-5 text-blue-400" />
                      <span>Transport Route</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 text-green-400">
                          <MapPin className="h-4 w-4" />
                          <span className="font-medium text-white">Departure</span>
                        </div>
                        <div className="pl-6 space-y-1">
                          <p className="font-semibold text-white">{cargoOffer.fromCity}, {cargoOffer.fromCountry}</p>
                          <p className="text-sm text-gray-400">{cargoOffer.fromAddress}</p>
                          <p className="text-xs text-gray-400">Cod poștal: {cargoOffer.fromPostalCode || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 text-red-400">
                          <MapPin className="h-4 w-4" />
                          <span className="font-medium text-white">Destination</span>
                        </div>
                        <div className="pl-6 space-y-1">
                          <p className="font-semibold text-white">{cargoOffer.toCity}, {cargoOffer.toCountry}</p>
                          <p className="text-sm text-gray-400">{cargoOffer.toAddress}</p>
                          <p className="text-xs text-gray-400">Cod poștal: {cargoOffer.toPostalCode || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    
                    {cargoOffer.distance && (
                      <div className="flex items-center justify-center pt-4 border-t border-slate-600">
                        <div className="flex items-center space-x-2 text-blue-400">
                          <ArrowRight className="h-4 w-4" />
                          <span className="font-medium text-white">Estimated distance: {cargoOffer.distance} km</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Cargo Details */}
                <div className="grid grid-cols-2 gap-6">
                  <Card className="bg-slate-800/70 border-slate-700">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-white">
                        <Package className="h-5 w-5 text-orange-400" />
                        <span>Cargo Details</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center space-x-2 text-gray-400 mb-1">
                            <Weight className="h-4 w-4" />
                            <span className="text-sm text-white">Weight</span>
                          </div>
                          <p className="font-semibold text-white">{cargoOffer.weight} kg</p>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 text-gray-400 mb-1">
                            <Package className="h-4 w-4" />
                            <span className="text-sm text-white">Cargo Type</span>
                          </div>
                          <p className="font-semibold text-white">{cargoOffer.cargoType}</p>
                        </div>
                      </div>
                      
                      {cargoOffer.requirements && cargoOffer.requirements.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-400 mb-2">Special requirements:</p>
                          <div className="flex flex-wrap gap-2">
                            {cargoOffer.requirements.map((req, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {req}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/70 border-slate-700">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-white">
                        <Calendar className="h-5 w-5 text-purple-400" />
                        <span>Schedule</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Loading date</p>
                        <p className="font-semibold text-white">{formatDate(cargoOffer.loadingDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Delivery date</p>
                        <p className="font-semibold text-white">{formatDate(cargoOffer.deliveryDate)}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Price Information */}
                <Card className="bg-slate-800/70 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <Euro className="h-5 w-5 text-green-400" />
                      <span>Price Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-green-400">€{cargoOffer.price}</p>
                        <p className="text-sm text-gray-400">Requested price</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">€{(cargoOffer.price / cargoOffer.weight).toFixed(2)}/kg</p>
                        <p className="text-sm text-gray-400">Price per kg</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

                        {/* Right Side - Company Info & Actions */}
            <div className="w-96 border-l border-slate-700 bg-slate-800">
              <div className="p-6 space-y-6">
                {/* Company Information */}
                <Card className="bg-slate-800/70 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <Building className="h-5 w-5 text-teal-400" />
                      <span>Provider Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Company Name</p>
                      <p className="font-semibold text-white">{cargoOffer.companyName || 'N/A'}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="font-semibold text-white">{cargoOffer.companyRating || 'New'}</span>
                      <Badge variant="secondary" className="flex items-center space-x-1">
                        <Shield className="h-3 w-3 text-green-400"/>
                        <span>Verified</span>
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Cargo Info Summary */}
                <Card className="bg-slate-800/70 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-sm text-white">Quick Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-white">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Offer ID:</span>
                      <span className="font-medium text-white">#{cargoOffer.id.slice(-8)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Posted:</span>
                      <span className="font-medium text-white">{formatDate(cargoOffer.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <Badge variant={isAccepted ? 'default' : 'secondary'} className="text-xs">
                        {isAccepted ? 'Accepted' : 'Available'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-700 bg-slate-900/80 backdrop-blur-sm">
             <div className="flex justify-end items-center">
                 {!isOwnOffer && cargoOffer.status === 'NEW' && (
                    <Button 
                      className="h-11 text-base px-6 bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        onClose(); // Close this modal first
                        setTimeout(() => onSendOffer(cargoOffer), 150); // Open the send offer dialog
                      }}
                    >
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Send Offer & Chat
                    </Button>
                 )}
                 
                 {isOwnOffer && (
                    <p className="text-sm text-center text-slate-400">This is your own offer. You can manage it from the marketplace list.</p>
                 )}
                 
                 {cargoOffer.status !== 'NEW' && !isOwnOffer && (
                    <p className="text-sm text-center text-slate-400">This offer is no longer available for new bids.</p>
                 )}
                <Button variant="outline" onClick={onClose} className="ml-4">Close</Button>
             </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}