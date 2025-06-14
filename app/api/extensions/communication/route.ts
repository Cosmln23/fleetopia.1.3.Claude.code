
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Communication APIs - SendGrid, Mailgun, Twilio integration
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider') || 'sendgrid';
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get recent notifications and communication logs
    const notifications = await prisma.notification.findMany({
      where: type !== 'all' ? { type } : {},
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    const communicationLogs = await prisma.communicationLog.findMany({
      where: type !== 'all' ? { type } : {},
      orderBy: { timestamp: 'desc' },
      take: limit
    });

    // Mock provider capabilities based on research
    const providerCapabilities = {
      sendgrid: {
        provider: 'sendgrid',
        types: ['email'],
        features: ['templates', 'analytics', 'ab_testing', 'automation'],
        deliverabilityRate: 0.97,
        maxEmailsPerDay: 100000,
        pricing: 'from_$15_per_month',
        integrations: ['salesforce', 'shopify', 'wordpress']
      },
      mailgun: {
        provider: 'mailgun',
        types: ['email'],
        features: ['email_parsing', 'validation', 'automation', 'analytics'],
        deliverabilityRate: 0.974,
        maxEmailsPerDay: 50000,
        pricing: 'from_$35_per_month',
        integrations: ['api_focused', 'developer_friendly']
      },
      twilio: {
        provider: 'twilio',
        types: ['email', 'sms', 'voice', 'push'],
        features: ['multi_channel', 'global_reach', 'programmable', 'scalable'],
        deliverabilityRate: 0.95,
        pricing: 'pay_as_you_go',
        integrations: ['sendgrid_email', 'voice_api', 'messaging_api']
      }
    };

    const capabilities = providerCapabilities[provider as keyof typeof providerCapabilities] || providerCapabilities.sendgrid;

    return NextResponse.json({
      success: true,
      data: {
        capabilities,
        notifications,
        communicationLogs,
        stats: {
          totalNotifications: notifications.length,
          totalCommunications: communicationLogs.length,
          deliveredToday: communicationLogs.filter(log => 
            log.status === 'delivered' && 
            log.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
          ).length
        }
      },
      provider,
      type,
      message: `Communication data retrieved from ${provider}`,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Communication API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch communication data',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    }, { status: 500 });
  }
}

// Send notification/communication
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      type, 
      provider = 'sendgrid', 
      recipient, 
      subject, 
      message, 
      priority = 'normal',
      userId 
    } = body;

    if (!type || !recipient || !message) {
      return NextResponse.json({
        success: false,
        error: 'Type, recipient, and message are required',
        timestamp: new Date()
      }, { status: 400 });
    }

    // Mock sending logic based on provider and type
    const sendResult = {
      success: Math.random() > 0.05, // 95% success rate
      messageId: `${provider.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      deliveryTime: Math.floor(Math.random() * 30) + 5, // 5-35 seconds
      cost: type === 'sms' ? 0.0075 : type === 'email' ? 0.0001 : 0.05
    };

    // Create notification record
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        provider,
        recipient,
        subject,
        message,
        status: sendResult.success ? 'sent' : 'failed',
        priority,
        sentAt: sendResult.success ? new Date() : null,
        deliveredAt: sendResult.success ? new Date(Date.now() + sendResult.deliveryTime * 1000) : null,
        metadata: {
          messageId: sendResult.messageId,
          cost: sendResult.cost,
          deliveryTime: sendResult.deliveryTime
        }
      }
    });

    // Create communication log
    const communicationLog = await prisma.communicationLog.create({
      data: {
        type,
        provider,
        sender: 'system@fleetopia.co',
        recipient,
        subject,
        content: message,
        status: sendResult.success ? 'sent' : 'failed',
        cost: sendResult.cost,
        timestamp: new Date(),
        metadata: {
          messageId: sendResult.messageId,
          priority,
          deliveryTime: sendResult.deliveryTime
        }
      }
    });

    // Simulate delivery status update for successful sends
    if (sendResult.success) {
      setTimeout(async () => {
        try {
          await prisma.notification.update({
            where: { id: notification.id },
            data: {
              status: 'delivered',
              deliveredAt: new Date()
            }
          });

          await prisma.communicationLog.update({
            where: { id: communicationLog.id },
            data: {
              status: 'delivered'
            }
          });
        } catch (updateError) {
          console.warn('Failed to update delivery status:', updateError);
        }
      }, sendResult.deliveryTime * 1000);
    }

    // Generate different response based on communication type
    let responseMessage = '';
    switch (type) {
      case 'email':
        responseMessage = `Email ${sendResult.success ? 'sent' : 'failed'} via ${provider}`;
        break;
      case 'sms':
        responseMessage = `SMS ${sendResult.success ? 'sent' : 'failed'} via ${provider}`;
        break;
      case 'push':
        responseMessage = `Push notification ${sendResult.success ? 'sent' : 'failed'} via ${provider}`;
        break;
      default:
        responseMessage = `Message ${sendResult.success ? 'sent' : 'failed'} via ${provider}`;
    }

    return NextResponse.json({
      success: sendResult.success,
      data: {
        notification,
        communicationLog,
        sendResult
      },
      message: responseMessage,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Communication send error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to send communication',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    }, { status: 500 });
  }
}

// Bulk communication endpoint
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      type, 
      provider = 'sendgrid', 
      recipients, 
      subject, 
      message, 
      priority = 'normal' 
    } = body;

    if (!type || !recipients || !Array.isArray(recipients) || !message) {
      return NextResponse.json({
        success: false,
        error: 'Type, recipients array, and message are required',
        timestamp: new Date()
      }, { status: 400 });
    }

    const results = [];
    let successCount = 0;
    let failureCount = 0;

    for (const recipient of recipients) {
      const sendResult = {
        success: Math.random() > 0.03, // 97% success rate for bulk
        messageId: `${provider.toUpperCase()}-BULK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        deliveryTime: Math.floor(Math.random() * 60) + 10, // 10-70 seconds
        cost: type === 'sms' ? 0.0075 : type === 'email' ? 0.0001 : 0.05
      };

      try {
        const notification = await prisma.notification.create({
          data: {
            type,
            provider,
            recipient,
            subject,
            message,
            status: sendResult.success ? 'sent' : 'failed',
            priority,
            sentAt: sendResult.success ? new Date() : null,
            metadata: {
              messageId: sendResult.messageId,
              cost: sendResult.cost,
              deliveryTime: sendResult.deliveryTime,
              bulkSend: true
            }
          }
        });

        await prisma.communicationLog.create({
          data: {
            type,
            provider,
            sender: 'system@fleetopia.co',
            recipient,
            subject,
            content: message,
            status: sendResult.success ? 'sent' : 'failed',
            cost: sendResult.cost,
            timestamp: new Date(),
            metadata: {
              messageId: sendResult.messageId,
              priority,
              deliveryTime: sendResult.deliveryTime,
              bulkSend: true
            }
          }
        });

        results.push({
          recipient,
          success: sendResult.success,
          messageId: sendResult.messageId,
          notificationId: notification.id
        });

        if (sendResult.success) {
          successCount++;
        } else {
          failureCount++;
        }

      } catch (dbError) {
        console.warn('Failed to store bulk communication for recipient:', recipient, dbError);
        results.push({
          recipient,
          success: false,
          error: 'Database error'
        });
        failureCount++;
      }
    }

    return NextResponse.json({
      success: successCount > 0,
      data: {
        results,
        summary: {
          total: recipients.length,
          successful: successCount,
          failed: failureCount,
          successRate: (successCount / recipients.length) * 100
        }
      },
      message: `Bulk ${type} sent: ${successCount} successful, ${failureCount} failed`,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Bulk communication error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to send bulk communication',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    }, { status: 500 });
  }
}
