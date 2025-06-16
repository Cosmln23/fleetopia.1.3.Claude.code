import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CargoOffer as PrismaCargoOffer } from '@prisma/client';
import { Star, MapPin, ArrowRight, Weight, Package, Calendar, Clock, FileText, Check, MessageSquare, FileEdit, Trash2, Hand } from 'lucide-react';
import { useSession } from 'next-auth/react';

type CargoOffer = PrismaCargoOffer & {
  acceptedByUserId?: string | null;
}

interface CargoOfferListProps {
  offers: CargoOffer[];
  getUrgencyColor: (urgency: string) => string;
  getPriceDisplay: (offer: CargoOffer) => string;
  handleAcceptOffer: (id: string) => void;
  handleMarkDelivered: (id: string) => void;
  setChatOffer: (offer: CargoOffer) => void;
  setOfferToEdit: (offer: CargoOffer) => void;
  setOfferToDelete: (id: string) => void;
  setOfferToAssign: (offer: any) => void;
}

export function CargoOfferList({
  offers,
  getUrgencyColor,
  getPriceDisplay,
  handleAcceptOffer,
  handleMarkDelivered,
  setChatOffer,
  setOfferToEdit,
  setOfferToDelete,
  setOfferToAssign
}: CargoOfferListProps) {
  const { data: session } = useSession();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
      {offers.map((offer) => (
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
                <span className="font-semibold">{offer.fromCountry}</span>
                <ArrowRight className="h-4 w-4 mx-2" />
                <span className="font-semibold">{offer.toCountry}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Distance: {offer.distance} km</p>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="flex items-center text-slate-300"><Weight className="h-4 w-4 mr-2 text-blue-400"/> Weight: {offer.weight.toLocaleString()} kg</div>
                <div className="flex items-center text-slate-300"><Package className="h-4 w-4 mr-2 text-blue-400"/> Volume: {offer.volume} m³</div>
                <div className="flex items-center text-slate-300"><Calendar className="h-4 w-4 mr-2 text-blue-400"/> Loading: {new Date(offer.loadingDate).toLocaleDateString()}</div>
                <div className="flex items-center text-slate-300"><Clock className="h-4 w-4 mr-2 text-blue-400"/> Delivery: {new Date(offer.deliveryDate).toLocaleDateString()}</div>
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
                     {/* Debug info - remove after testing */}
                     {process.env.NODE_ENV === 'development' && (
                       <div className="text-xs text-gray-400 w-full">
                         Session: {session?.user?.id ? 'Yes' : 'No'} | 
                         Status: {offer.status} | 
                         Owner: {offer.userId === session?.user?.id ? 'Yes' : 'No'} |
                         Accepted: {offer.acceptedByUserId === session?.user?.id ? 'Yes' : 'No'}
                       </div>
                     )}
                     {session && session.user && session.user.id !== offer.userId && offer.status === 'NEW' && (
                       <Button
                         variant="default"
                         size="sm"
                         className="h-8 bg-blue-600 hover:bg-blue-700"
                         title="Accept & Open Chat to Negotiate"
                         onClick={() => handleAcceptOffer(offer.id)}
                       >
                         <MessageSquare className="h-4 w-4 mr-2" />
                         Accept & Chat
                       </Button>
                     )}
                     {session && session.user && session.user.id === offer.acceptedByUserId && offer.status === 'TAKEN' && (
                      <Button
                         variant="default"
                         size="sm"
                         className="h-8 bg-purple-600 hover:bg-purple-700"
                         title="Open Chat"
                         onClick={() => setChatOffer(offer)}
                       >
                         <MessageSquare className="h-4 w-4 mr-2" />
                         Chat
                       </Button>
                     )}
                     {session && session.user && session.user.id === offer.userId && offer.status === 'TAKEN' && (
                       <Button
                         variant="default"
                         size="sm"
                         className="h-8 bg-green-600 hover:bg-green-700"
                         title="Mark as Delivered"
                         onClick={() => handleMarkDelivered(offer.id)}
                       >
                         <Check className="h-4 w-4 mr-2" />
                         Delivered
                       </Button>
                     )}
                     {session && session.user && session.user.id === offer.userId && (
                      <>
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
                      </>
                     )}
                     {session && session.user && session.user.id === offer.acceptedByUserId && offer.status === 'COMPLETED' && (
                       <div className="flex items-center gap-2">
                         <span className="text-xs text-green-400 font-semibold">Accepted</span>
                         <Button 
                             variant="outline"
                             size="sm"
                             className="h-7 text-xs bg-blue-800/70 hover:bg-blue-700 border-blue-600"
                             title="Assign to Vehicle"
                             onClick={() => setOfferToAssign(offer)}
                         >
                           <Hand className="h-3 w-3 mr-1" />
                           Assign to Vehicle
                         </Button>
                       </div>
                     )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
} 