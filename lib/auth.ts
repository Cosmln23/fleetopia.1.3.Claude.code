import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

// Fallback pentru demo când variabilele de mediu nu sunt setate
const providers = [];

// Adaugă Google provider doar dacă variabilele sunt configurate
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

// Adaugă demo credentials provider pentru testing
providers.push(
  CredentialsProvider({
    name: 'Demo Login',
    credentials: {
      email: { label: 'Email', type: 'email', placeholder: 'demo@fleetopia.com' },
      password: { label: 'Password', type: 'password', placeholder: 'demo123' },
    },
    async authorize(credentials) {
      // Demo login pentru testing - în producție va fi conectat la baza de date
      if (credentials?.email === 'demo@fleetopia.com' && credentials?.password === 'demo123') {
        return {
          id: 'demo-user-id',
          email: 'demo@fleetopia.com',
          name: 'Demo User',
        };
      }
      return null;
    },
  })
);

export const authOptions: NextAuthOptions = {
  providers,
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-demo',
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
      }
      return session;
    },
  },
  pages: {
    // Pagini custom de login în viitor
    // signIn: '/auth/signin',
  },
}; 
