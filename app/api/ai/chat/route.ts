import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Anthropic from '@anthropic-ai/sdk';

// Initialize the Anthropic client with the API key from environment variables
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate the user
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Check for Anthropic API Key
    if (!process.env.ANTHROPIC_API_KEY) {
        return NextResponse.json(
          { error: 'Anthropic API key is not configured on the server.' },
          { status: 500 }
        );
    }

    // 3. Parse the request body
    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is a required field.' },
        { status: 400 }
      );
    }

    // Map the history to the format expected by Anthropic
    const mappedHistory = (history || [])
        .filter((msg: any) => msg.type === 'user' || msg.type === 'ai')
        .map((msg: any) => ({
            role: msg.type === 'ai' ? 'assistant' : 'user',
            content: msg.message,
        }));

    // 4. Call the Anthropic API
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307', // Using Haiku for speed and cost-efficiency
      system: `You are Claude, the AI Assistant for Fleetopia - a Transport Paradise platform. 
               You help dispatchers and fleet managers with logistics, route optimization, cargo management, and fleet operations.
               Be helpful, concise, and professional. Provide actionable advice for transport and logistics challenges.
               You're integrated into the Dispatch Center to assist with daily operations.
               Your knowledge cutoff is 2023. You cannot access real-time platform data but can provide general guidance.`,
      messages: [
        ...mappedHistory,
        { 
          role: 'user', 
          content: message 
        },
      ],
      max_tokens: 1024,
    });

    // Find the first text block in the response content.
    const textContent = response.content.find(block => block.type === 'text');
    const aiResponse = textContent ? textContent.text : 'Sorry, I could not generate a response.';

    return NextResponse.json({ reply: aiResponse });

  } catch (error) {
    console.error('Error in Anthropic chat route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error.';
    return NextResponse.json(
      { error: 'Failed to get response from AI.', details: errorMessage },
      { status: 500 }
    );
  }
} 