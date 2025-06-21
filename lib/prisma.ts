import { PrismaClient } from '@prisma/client'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more: https://pris.ly/d/help/next-js-best-practices

// Declare a global variable to hold the Prisma client
// This is done to prevent creating a new client on every hot reload
declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma;
}

export default prisma 
