'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CargoOffer } from '@prisma/client';
import { Euro, Send } from 'lucide-react';

interface SendOfferDialogProps {
  isOpen: boolean;
  onClose: () => void;
  offer: CargoOffer | null;
  onSubmit: (offerId: string, price: number) => Promise<boolean>;
}

export function SendOfferDialog({ isOpen, onClose, offer, onSubmit }: SendOfferDialogProps) {
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!offer) return null;

  const handleSubmit = async () => {
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      toast.error('Please enter a valid price.');
      return;
    }
    
    setIsSubmitting(true);
    const success = await onSubmit(offer.id, numericPrice);
    
    if (success) {
      try {
        // Automatically send the initial message to start the chat
        const messageResponse = await fetch(`/api/marketplace/cargo/${offer.id}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `I have sent an offer of €${numericPrice}. Let's discuss.`
          }),
        });

        if (!messageResponse.ok) {
          throw new Error('Offer was sent, but failed to start chat session.');
        }

        toast.success("Offer sent and chat started!");

      } catch (chatError) {
        console.error(chatError);
        toast.error(chatError instanceof Error ? chatError.message : 'An unknown chat error occurred.');
      } finally {
        setPrice('');
        onClose();
      }
    }
    
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>Send Offer for "{offer.title}"</DialogTitle>
          <DialogDescription>
            Submit your price offer. The owner will be notified and you can start chatting.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price
            </Label>
            <div className="relative col-span-3">
              <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="pl-9 bg-slate-800 border-slate-600"
                placeholder="e.g., 890"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Sending...' : 'Send Offer & Chat'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 