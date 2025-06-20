import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';

import { DispatcherAnalysis } from '@/lib/dispatcher-types';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { analysis }: { analysis: DispatcherAnalysis } = await request.json();
    
    if (!analysis) {
      return NextResponse.json({ error: 'Analysis data is required' }, { status: 400 });
    }

    // Generate personalized message in English
    const userName = session.user.name || 'User';
    const { availableVehicles, newOffers, suggestions, todayProfit } = analysis;

    let message: string;

    if (availableVehicles === 0) {
      message = `Hello ${userName}! All your vehicles are currently busy. 📊`;
    } else if (suggestions.length === 0) {
      message = `Hello ${userName}! You have ${availableVehicles} available vehicles, but no suitable offers right now. I'll check back for new opportunities! 🚛`;
    } else {
      const topSuggestion = suggestions[0];
      message = `Hello ${userName}! 🎯 I found ${suggestions.length} opportunities for you. 
    
Best option: €${topSuggestion?.estimatedProfit || 0} profit for ${topSuggestion?.estimatedDistance || 0}km. 

Today's estimated profit: €${todayProfit} with ${availableVehicles} available vehicles.`;
    }
    
    return NextResponse.json({ message });
  } catch (error) {
    console.error('Get personalized message error:', error);
    return NextResponse.json(
      { error: 'Failed to get personalized message' },
      { status: 500 }
    );
  }
}
