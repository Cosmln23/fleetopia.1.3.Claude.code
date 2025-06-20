import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

// Clerk authentication utilities
export async function requireAuth() {
  const { userId } = auth();
  
  if (!userId) {
    redirect('/sign-in');
  }
  
  return userId;
}

export async function getCurrentUser() {
  const user = await currentUser();
  return user;
}

export async function getUserId() {
  const { userId } = auth();
  return userId;
}

export async function requireRole(allowedRoles: string[] = ['owner', 'editor']) {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }
  
  const userRole = user.publicMetadata?.role as string || 'user';
  
  if (!allowedRoles.includes(userRole)) {
    throw new Error('Insufficient permissions');
  }
  
  return user;
}

// Helper function to check if user is authenticated
export function isAuthenticated() {
  const { userId } = auth();
  return !!userId;
}

// Get user role from metadata
export async function getUserRole() {
  const user = await currentUser();
  return user?.publicMetadata?.role as string || 'user';
} 
