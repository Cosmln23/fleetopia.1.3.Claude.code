/**
 * Dispatcher API - Chat Processing Endpoint
 * REST API for chat processing as specified in user's plan
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { conversationHandler } from '@/lib/algorithms/conversation-handler';

export const dynamic = 'force-dynamic';

// POST /api/dispatcher/chat - Process chat messages
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { message, context } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    console.log(`💬 API: Processing chat message from user ${userId}`);

    const startTime = Date.now();

    // Process user input through conversation handler
    const response = await conversationHandler.processUserInput(message);

    const executionTime = Date.now() - startTime;

    // Format response as per user's plan structure
    const chatResponse = {
      response: {
        message: response.message,
        intent: response.intent,
        confidence: response.confidence,
        data: response.data,
        suggestions: response.suggestions
      },
      metadata: {
        timestamp: new Date().toISOString(),
        execution_time_ms: executionTime,
        user_id: userId,
        intent_detected: response.intent,
        confidence_score: response.confidence
      },
      context: {
        conversation_id: context?.conversation_id || generateConversationId(),
        message_count: (context?.message_count || 0) + 1,
        session_start: context?.session_start || new Date().toISOString(),
        last_intent: response.intent,
        user_preferences: context?.user_preferences || {}
      },
      debug: {
        original_message: message,
        processing_time: executionTime,
        system_status: 'operational'
      }
    };

    console.log(`✅ API: Chat response generated in ${executionTime}ms`);
    return NextResponse.json(chatResponse);

  } catch (error) {
    console.error('❌ API Error in chat processing:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to process chat message',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// GET /api/dispatcher/chat - Get conversation context
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    // Return conversation context and help information
    const contextResponse = {
      available_commands: [
        {
          command: "What routes do you have for today?",
          description: "Get route suggestions",
          example: "What profitable routes are available?"
        },
        {
          command: "Where is truck [license-plate]?",
          description: "Get vehicle status and location",
          example: "Where is truck B-123-ABC?"
        },
        {
          command: "Show me fleet status",
          description: "Get overview of all vehicles",
          example: "Fleet overview"
        },
        {
          command: "Any urgent cargo?",
          description: "Get urgent delivery requirements",
          example: "Show urgent deliveries"
        },
        {
          command: "Profit analysis",
          description: "Get profitability insights",
          example: "Show me profit analysis"
        },
        {
          command: "Daily summary",
          description: "Get daily fleet summary",
          example: "How was today?"
        }
      ],
      system_status: {
        ai_dispatcher: 'online',
        matching_engine: 'operational',
        fleet_tracking: 'connected',
        marketplace: 'synchronized'
      },
      user_context: {
        user_id: userId,
        session_active: true,
        conversation_id: conversationId || 'new-session'
      }
    };

    return NextResponse.json(contextResponse);

  } catch (error) {
    console.error('❌ API Error getting chat context:', error);
    return NextResponse.json(
      { error: 'Failed to get conversation context' },
      { status: 500 }
    );
  }
}

// Helper function
function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}