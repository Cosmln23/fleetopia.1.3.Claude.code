
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Financial APIs - Stripe, BillingPlatform, Accounting integration
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider') || 'stripe';
    const type = searchParams.get('type') || 'all';
    const fleetId = searchParams.get('fleetId');
    const period = searchParams.get('period') || 'monthly';

    // Mock financial data based on research
    const mockFinancialData = {
      stripe: {
        provider: 'stripe',
        features: ['payment_processing', 'billing_automation', 'refunds', 'reporting'],
        transactions: [
          {
            type: 'revenue',
            category: 'freight_delivery',
            amount: 2500.00,
            currency: 'USD',
            description: 'Freight delivery payment - Load #UF-001',
            provider: 'stripe',
            externalId: 'pi_1234567890',
            status: 'completed',
            paymentMethod: 'card',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            metadata: {
              loadId: 'UF-001',
              customerId: 'cus_ABC123',
              invoiceId: 'inv_DEF456'
            }
          },
          {
            type: 'fuel',
            category: 'operating_expense',
            amount: -380.25,
            currency: 'USD',
            description: 'Fuel purchase - Shell Station #1234',
            provider: 'stripe',
            externalId: 'pi_0987654321',
            status: 'completed',
            paymentMethod: 'fleet_card',
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            metadata: {
              stationId: 'SHELL-1234',
              fuelType: 'diesel',
              quantity: 250
            }
          },
          {
            type: 'maintenance',
            category: 'operating_expense',
            amount: -285.75,
            currency: 'USD',
            description: 'Brake pad replacement',
            provider: 'stripe',
            externalId: 'pi_1122334455',
            status: 'completed',
            paymentMethod: 'bank_transfer',
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            metadata: {
              maintenanceId: 'maint_789',
              serviceProvider: 'TruckCare Services'
            }
          }
        ],
        invoices: [
          {
            invoiceNumber: 'INV-2025-001',
            fleetId,
            clientId: 'client_ABC123',
            amount: 2500.00,
            currency: 'USD',
            status: 'paid',
            dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            paidDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            items: [
              {
                description: 'Freight delivery - NY to LA',
                quantity: 1,
                rate: 2500.00,
                amount: 2500.00
              }
            ],
            provider: 'stripe'
          },
          {
            invoiceNumber: 'INV-2025-002',
            fleetId,
            clientId: 'client_DEF456',
            amount: 1800.00,
            currency: 'USD',
            status: 'pending',
            dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            items: [
              {
                description: 'Freight delivery - Chicago to Houston',
                quantity: 1,
                rate: 1800.00,
                amount: 1800.00
              }
            ],
            provider: 'stripe'
          }
        ],
        summary: {
          totalRevenue: 4300.00,
          totalExpenses: 666.00,
          netProfit: 3634.00,
          profitMargin: 0.845
        }
      },
      billing_platform: {
        provider: 'billing_platform',
        features: ['enterprise_billing', 'usage_based', 'subscription_management', 'reconciliation'],
        transactions: [
          {
            type: 'subscription',
            category: 'software_license',
            amount: -299.00,
            currency: 'USD',
            description: 'Fleet management software - Monthly subscription',
            provider: 'billing_platform',
            externalId: 'sub_BP123456',
            status: 'completed',
            paymentMethod: 'auto_debit',
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            metadata: {
              subscriptionId: 'sub_fleet_pro',
              billingPeriod: 'monthly'
            }
          }
        ],
        summary: {
          recurringRevenue: 299.00,
          oneTimeCharges: 0.00,
          totalBilled: 299.00
        }
      },
      quickbooks: {
        provider: 'quickbooks',
        features: ['accounting_integration', 'tax_preparation', 'financial_reporting', 'expense_tracking'],
        accounts: {
          revenue: 125000.00,
          expenses: 89500.00,
          assets: 450000.00,
          liabilities: 125000.00,
          equity: 325000.00
        },
        reports: {
          profitLoss: {
            period: 'monthly',
            revenue: 12500.00,
            expenses: 8950.00,
            netIncome: 3550.00
          },
          cashFlow: {
            operatingActivities: 3200.00,
            investingActivities: -15000.00,
            financingActivities: 5000.00,
            netCashFlow: -6800.00
          }
        }
      }
    };

    const financialData = mockFinancialData[provider as keyof typeof mockFinancialData] || mockFinancialData.stripe;

    // Store financial transactions
    if ('transactions' in financialData) {
      for (const transaction of financialData.transactions) {
        try {
          await prisma.financialTransaction.create({
            data: {
              fleetId,
              type: transaction.type,
              category: transaction.category,
              amount: transaction.amount,
              currency: transaction.currency,
              description: transaction.description,
              provider: transaction.provider,
              externalId: transaction.externalId,
              status: transaction.status,
              paymentMethod: transaction.paymentMethod,
              date: transaction.date,
              metadata: transaction.metadata
            }
          });
        } catch (dbError) {
          console.warn('Failed to store financial transaction:', dbError);
        }
      }
    }

    // Store invoices
    if ('invoices' in financialData) {
      for (const invoice of financialData.invoices) {
        try {
          await prisma.invoice.upsert({
            where: { invoiceNumber: invoice.invoiceNumber },
            update: {
              fleetId: invoice.fleetId,
              clientId: invoice.clientId,
              amount: invoice.amount,
              currency: invoice.currency,
              status: invoice.status,
              dueDate: invoice.dueDate,
              paidDate: invoice.paidDate || null,
              items: invoice.items,
              provider: invoice.provider
            },
            create: {
              invoiceNumber: invoice.invoiceNumber,
              fleetId: invoice.fleetId,
              clientId: invoice.clientId,
              amount: invoice.amount,
              currency: invoice.currency,
              status: invoice.status,
              dueDate: invoice.dueDate,
              paidDate: invoice.paidDate || null,
              items: invoice.items,
              provider: invoice.provider
            }
          });
        } catch (dbError) {
          console.warn('Failed to store invoice:', invoice.invoiceNumber, dbError);
        }
      }
    }

    // Generate expense report
    const expenseReport = {
      fleetId,
      period,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      totalAmount: Math.abs(financialData.transactions?.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0) || 0),
      categories: {
        fuel: 380.25,
        maintenance: 285.75,
        insurance: 450.00,
        tolls: 125.50,
        other: 89.50
      },
      provider,
      generatedAt: new Date()
    };

    try {
      await prisma.expenseReport.create({
        data: expenseReport
      });
    } catch (dbError) {
      console.warn('Failed to store expense report:', dbError);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...financialData,
        expenseReport
      },
      provider,
      type,
      period,
      message: `Financial data retrieved from ${provider}`,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Financial API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch financial data',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    }, { status: 500 });
  }
}

// Process payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      amount, 
      currency = 'USD', 
      description, 
      paymentMethod, 
      provider = 'stripe',
      fleetId,
      type = 'revenue',
      category
    } = body;

    if (!amount || !description || !paymentMethod) {
      return NextResponse.json({
        success: false,
        error: 'Amount, description, and payment method are required',
        timestamp: new Date()
      }, { status: 400 });
    }

    // Mock payment processing
    const paymentResult = {
      success: Math.random() > 0.05, // 95% success rate
      transactionId: `${provider.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      processingTime: Math.floor(Math.random() * 5) + 1, // 1-5 seconds
      fees: amount * 0.029 + 0.30 // Stripe-like fees
    };

    // Create financial transaction
    const transaction = await prisma.financialTransaction.create({
      data: {
        fleetId,
        type,
        category: category || 'general',
        amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
        currency,
        description,
        provider,
        externalId: paymentResult.transactionId,
        status: paymentResult.success ? 'completed' : 'failed',
        paymentMethod,
        date: new Date(),
        metadata: {
          processingTime: paymentResult.processingTime,
          fees: paymentResult.fees,
          originalAmount: amount
        }
      }
    });

    return NextResponse.json({
      success: paymentResult.success,
      data: {
        transaction,
        paymentResult
      },
      message: paymentResult.success ? 'Payment processed successfully' : 'Payment failed',
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process payment',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    }, { status: 500 });
  }
}

// Generate invoice
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      fleetId, 
      clientId, 
      items, 
      dueDate, 
      provider = 'stripe' 
    } = body;

    if (!fleetId || !clientId || !items || !Array.isArray(items)) {
      return NextResponse.json({
        success: false,
        error: 'Fleet ID, client ID, and items array are required',
        timestamp: new Date()
      }, { status: 400 });
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.quantity * item.rate), 0);

    // Generate invoice number
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        fleetId,
        clientId,
        amount: totalAmount,
        currency: 'USD',
        status: 'pending',
        dueDate: new Date(dueDate),
        items,
        provider
      }
    });

    // Create corresponding financial transaction
    await prisma.financialTransaction.create({
      data: {
        fleetId,
        type: 'revenue',
        category: 'invoiced_services',
        amount: totalAmount,
        currency: 'USD',
        description: `Invoice ${invoiceNumber}`,
        provider,
        externalId: invoice.id,
        status: 'pending',
        paymentMethod: 'invoice',
        date: new Date(),
        metadata: {
          invoiceId: invoice.id,
          clientId,
          itemCount: items.length
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: invoice,
      message: 'Invoice generated successfully',
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Invoice generation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate invoice',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    }, { status: 500 });
  }
}
