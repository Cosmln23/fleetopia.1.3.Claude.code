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
import { CargoOffer } from '@/lib/stores/marketplace-store';
import { useUser } from '@clerk/nextjs';
import { useChat } from '@/contexts/chat-provider';

interface CargoDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  cargoOffer: CargoOffer | null;
}

export function CargoDetailModal({ isOpen, onClose, cargoOffer }: CargoDetailModalProps) {
  const { user } = useUser();
  const { openChat } = useChat();

  if (!cargoOffer) return null;

  const isOwnOffer = cargoOffer.userId === user?.id;
  const isAccepted = cargoOffer.status === 'accepted';

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
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
                    Detalii complete despre transportul de marfă
                  </DialogDescription>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant={getUrgencyColor(cargoOffer.urgency)} className="flex items-center space-x-1">
                      {getUrgencyIcon(cargoOffer.urgency)}
                      <span className="capitalize">{cargoOffer.urgency}</span>
                    </Badge>
                    <Badge variant={isAccepted ? 'default' : 'secondary'}>
                      {isAccepted ? 'Acceptat' : 'Disponibil'}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-full text-white hover:bg-slate-600"
              >
                <X className="h-4 w-4" />
              </Button>
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
                      <span>Traseu Transport</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 text-green-400">
                          <MapPin className="h-4 w-4" />
                          <span className="font-medium text-white">Plecare</span>
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
                          <span className="font-medium text-white">Destinație</span>
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
                          <span className="font-medium text-white">Distanță estimată: {cargoOffer.distance} km</span>
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
                        <span>Detalii Marfă</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center space-x-2 text-gray-400 mb-1">
                            <Weight className="h-4 w-4" />
                            <span className="text-sm text-white">Greutate</span>
                          </div>
                          <p className="font-semibold text-white">{cargoOffer.weight} kg</p>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 text-gray-400 mb-1">
                            <Package className="h-4 w-4" />
                            <span className="text-sm text-white">Tip marfă</span>
                          </div>
                          <p className="font-semibold text-white">{cargoOffer.cargoType}</p>
                        </div>
                      </div>
                      
                      {cargoOffer.requirements && cargoOffer.requirements.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-400 mb-2">Cerințe speciale:</p>
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
                        <span>Programare</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Data încărcare</p>
                        <p className="font-semibold text-white">{formatDate(cargoOffer.loadingDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Data livrare</p>
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
                      <span>Informații Preț</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-green-400">€{cargoOffer.price}</p>
                        <p className="text-sm text-gray-400">Preț solicitat</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">€{(cargoOffer.price / cargoOffer.weight).toFixed(2)}/kg</p>
                        <p className="text-sm text-gray-400">Preț per kg</p>
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
                      <Building className="h-5 w-5 text-blue-400" />
                      <span>Informații Firmă</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center">
                        <Building className="h-6 w-6 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{cargoOffer.companyName || 'Companie Transport'}</h3>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium text-white">4.8</span>
                          <span className="text-sm text-gray-400">(127 review-uri)</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-white">
                        <Shield className="h-4 w-4 text-green-400" />
                        <span>Companie verificată</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-white">
                        <Truck className="h-4 w-4 text-blue-400" />
                        <span>15+ ani experiență</span>
                      </div>
                    </div>

                    {cargoOffer.user && (
                      <Separator />
                    )}

                    {cargoOffer.user && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-white">Contact:</p>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 text-sm text-white">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span>{cargoOffer.user.email}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-white">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span>+40 XXX XXX XXX</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                {!isOwnOffer && (
                  <div className="space-y-3">
                    <Button
                      onClick={handleChatClick}
                      className="w-full flex items-center justify-center space-x-2"
                      variant="outline"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Trimite Mesaj</span>
                    </Button>
                    
                    {!isAccepted && (
                      <Button
                        onClick={handleAcceptOffer}
                        className="w-full flex items-center justify-center space-x-2"
                        size="lg"
                      >
                        <CheckCircle className="h-5 w-5" />
                        <span>Accept Oferta</span>
                      </Button>
                    )}
                  </div>
                )}

                {/* Cargo Info Summary */}
                <Card className="bg-slate-800/70 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-sm text-white">Rezumat Rapid</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-white">
                    <div className="flex justify-between">
                      <span className="text-gray-400">ID Ofertă:</span>
                      <span className="font-medium text-white">#{cargoOffer.id.slice(-8)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Postat:</span>
                      <span className="font-medium text-white">{formatDate(cargoOffer.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <Badge variant={isAccepted ? 'default' : 'secondary'} className="text-xs">
                        {isAccepted ? 'Acceptat' : 'Disponibil'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}