import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST() {
  try {
    // Delete all system alerts
    await prisma.systemAlert.deleteMany({});

    return NextResponse.json({ 
      success: true, 
      message: 'All alerts cleared successfully' 
    });
  } catch (error) {
    console.error('Error clearing all alerts:', error);
    return NextResponse.json(
      { error: 'Failed to clear all alerts' },
      { status: 500 }
    );
  }
} 