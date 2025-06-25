'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { Send, RefreshCw } from 'lucide-react';

// Form validation schema, identical to the backend one
const formSchema = z.object({
  to: z.string().email({ message: 'Invalid email address.' }),
  subject: z.string().min(3, { message: 'Subject must be at least 3 characters long.' }),
  body: z.string().min(10, { message: 'Message must be at least 10 characters long.' }),
});

type FormData = z.infer<typeof formSchema>;

interface SendNotificationDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  initialBody?: string;
}

export function SendNotificationDialog({ isOpen, onOpenChange, initialBody = '' }: SendNotificationDialogProps) {
  const [isSending, setIsSending] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      to: '',
      subject: '',
      body: initialBody,
    },
  });

  async function onSubmit(values: FormData) {
    setIsSending(true);
    try {
      const response = await fetch('/api/dispatcher/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Notification Sent!', { description: `Email to ${values.to} was sent successfully.` });
        onOpenChange(false); // Close dialog on success
        form.reset();
      } else {
        toast.error('Send Failed', { description: result.details || 'Check if your Gmail account is connected in Settings.' });
      }
    } catch (error) {
      toast.error('Network Error', { description: 'Could not contact the server.' });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Notification via Email</DialogTitle>
          <DialogDescription>
            Compose and send an email from here. The message will be sent using your connected Gmail account.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To</FormLabel>
                  <FormControl>
                    <Input placeholder="example@domain.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Notification subject" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Write the detailed message here..." className="resize-y min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSending}>
                {isSending ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Send Email
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 