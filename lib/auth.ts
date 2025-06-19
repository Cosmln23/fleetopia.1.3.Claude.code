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

// Adaugă credentials provider cu utilizatori predefiniti
providers.push(
  CredentialsProvider({
    name: 'Fleetopia Login',
    credentials: {
      email: { label: 'Email', type: 'email', placeholder: 'owner@fleetopia.com' },
      password: { label: 'Password', type: 'password', placeholder: 'owner123' },
    },
    async authorize(credentials) {
      // Utilizatori predefiniti - în viitor vor fi din baza de date
      const users = [
        {
          id: 'owner-001',
          email: 'owner@fleetopia.com',
          password: 'owner123',
          name: 'Fleet Owner',
          role: 'OWNER'
        },
        {
          id: 'editor-001', 
          email: 'editor@fleetopia.com',
          password: 'editor123',
          name: 'Fleet Editor',
          role: 'EDITOR'
        }
      ];

      const user = users.find(u => 
        u.email === credentials?.email && u.password === credentials?.password
      );

      if (user) {
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
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
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    // Pagini custom de login în viitor
    // signIn: '/auth/signin',
  },
}; 
