'use client';

import { UserButton, SignInButton, useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

export function AuthButton() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return <Button variant="ghost" size="sm">Loading...</Button>;
  }

  if (isSignedIn) {
    return <UserButton afterSignOutUrl="/" />;
  }

  return (
    <SignInButton mode="modal">
      <Button variant="ghost" size="sm">
        <LogIn className="mr-2 h-4 w-4" />
        Login
      </Button>
    </SignInButton>
  );
} 
