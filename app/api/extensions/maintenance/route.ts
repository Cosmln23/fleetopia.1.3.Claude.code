
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Maintenance APIs - Fleetio, OBD-II, Auto Parts integration
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider') || 'fleetio';
    const vehicleId = searchParams.get('vehicleId');
    const type = searchParams.get('type') || 'all';
    const predictive = searchParams.get('predictive') === 'true';

    // Mock maintenance data based on research
    const mockMaintenanceData = {
      fleetio: {
        provider: 'fleetio',
        features: ['preventive_scheduling', 'work_orders', 'inventory_management', 'cost_tracking'],
        integrations: ['geotab', 'samsara', 'keeptruckin'],
        records: [
          {
            type: 'preventive',
            description: 'Oil change and filter replacement',
            cost: 125.50,
            mileage: 125847,
            serviceDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            nextService: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
            provider: 'AutoCare Plus',
            status: 'completed',
            parts: [
              { name: 'Engine Oil', quantity: 6, cost: 45.00 },
              { name: 'Oil Filter', quantity: 1, cost: 15.50 },
              { name: 'Air Filter', quantity: 1, cost: 25.00 }
            ],
            predictive: false
          },
          {
            type: 'corrective',
            description: 'Brake pad replacement - front axle',
            cost: 285.75,
            mileage: 125200,
            serviceDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
            nextService: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
            provider: 'TruckCare Services',
            status: 'completed',
            parts: [
              { name: 'Brake Pads (Front)', quantity: 1, cost: 125.00 },
              { name: 'Brake Rotors', quantity: 2, cost: 160.75 }
            ],
            predictive: false
          },
          {
            type: 'inspection',
            description: 'Annual DOT inspection',
            cost: 95.00,
            mileage: 124500,
            serviceDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            nextService: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000),
            provider: 'Certified Inspection Center',
            status: 'completed',
            parts: [],
            predictive: false
          }
        ],
        predictiveAlerts: predictive ? [
          {
            component: 'transmission',
            prediction: {
              failureProbability: 0.15,
              estimatedFailureDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
              confidence: 0.82,
              basedOn: ['temperature_trends', 'vibration_analysis', 'fluid_analysis']
            },
            recommendedDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            priority: 'medium',
            costEstimate: 2500.00,
            description: 'Transmission showing early signs of wear based on temperature and vibration patterns'
          },
          {
            component: 'tires',
            prediction: {
              failureProbability: 0.25,
              estimatedFailureDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
              confidence: 0.91,
              basedOn: ['tread_depth', 'pressure_monitoring', 'wear_patterns']
            },
            recommendedDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
            priority: 'high',
            costEstimate: 1200.00,
            description: 'Front tires showing uneven wear patterns and approaching minimum tread depth'
          }
        ] : []
      },
      obd_ii: {
        provider: 'obd_ii',
        features: ['real_time_diagnostics', 'dtc_codes', 'engine_parameters', 'emissions_monitoring'],
        diagnostics: {
          engineStatus: 'normal',
          dtcCodes: Math.random() > 0.7 ? ['P0171', 'P0174'] : [],
          engineParameters: {
            rpm: 1850 + Math.random() * 500,
            coolantTemp: 185 + Math.random() * 15,
            oilPressure: 45 + Math.random() * 10,
            fuelTrim: -2.5 + Math.random() * 5,
            intakeAirTemp: 75 + Math.random() * 20,
            throttlePosition: 15 + Math.random() * 10
          },
          emissionsData: {
            noxLevel: 0.15 + Math.random() * 0.1,
            particulateLevel: 0.008 + Math.random() * 0.005,
            co2Level: 245 + Math.random() * 50
          },
          lastUpdate: new Date()
        },
        alerts: Math.random() > 0.8 ? [
          {
            type: 'engine_warning',
            severity: 'medium',
            code: 'P0171',
            description: 'System too lean (Bank 1)',
            recommendation: 'Check air filter and fuel system'
          }
        ] : []
      },
      auto_parts_api: {
        provider: 'auto_parts_api',
        features: ['parts_availability', 'pricing', 'compatibility', 'suppliers'],
        partsData: [
          {
            partNumber: 'OF-4967',
            name: 'Engine Oil Filter',
            category: 'filters',
            price: 15.50,
            availability: 'in_stock',
            supplier: 'AutoParts Direct',
            compatibility: ['2018-2023 Freightliner Cascadia'],
            warranty: '12_months'
          },
          {
            partNumber: 'BP-8821',
            name: 'Brake Pads - Front Axle',
            category: 'brakes',
            price: 125.00,
            availability: 'in_stock',
            supplier: 'TruckParts Plus',
            compatibility: ['2018-2023 Freightliner Cascadia'],
            warranty: '24_months'
          },
          {
            partNumber: 'TR-5544',
            name: 'Tire - 295/75R22.5',
            category: 'tires',
            price: 285.00,
            availability: 'limited_stock',
            supplier: 'Commercial Tire Co',
            compatibility: ['Commercial Trucks'],
            warranty: '60_months'
          }
        ]
      }
    };

    const maintenanceData = mockMaintenanceData[provider as keyof typeof mockMaintenanceData] || mockMaintenanceData.fleetio;

    // Store maintenance records if from fleetio
    if (provider === 'fleetio' && vehicleId) {
      for (const record of maintenanceData.records) {
        try {
          await prisma.maintenanceRecord.create({
            data: {
              vehicleId,
              type: record.type,
              description: record.description,
              cost: record.cost,
              mileage: record.mileage,
              serviceDate: record.serviceDate,
              nextService: record.nextService,
              provider: record.provider,
              status: record.status,
              parts: record.parts,
              predictive: record.predictive
            }
          });
        } catch (dbError) {
          console.warn('Failed to store maintenance record:', dbError);
        }
      }

      // Store predictive maintenance alerts
      for (const alert of maintenanceData.predictiveAlerts) {
        try {
          await prisma.predictiveMaintenance.create({
            data: {
              vehicleId,
              component: alert.component,
              prediction: alert.prediction,
              confidence: alert.prediction.confidence,
              recommendedDate: alert.recommendedDate,
              priority: alert.priority,
              costEstimate: alert.costEstimate,
              provider: 'ai_ml_service',
              status: 'pending'
            }
          });

          // Create alert for high priority items
          if (alert.priority === 'high' || alert.priority === 'critical') {
            await prisma.alert.create({
              data: {
                vehicleId,
                type: 'maintenance',
                severity: alert.priority === 'critical' ? 'critical' : 'high',
                title: `Predictive Maintenance Alert: ${alert.component}`,
                message: alert.description,
                data: {
                  component: alert.component,
                  prediction: alert.prediction,
                  costEstimate: alert.costEstimate
                },
                provider: 'predictive_ai'
              }
            });
          }
        } catch (dbError) {
          console.warn('Failed to store predictive maintenance:', dbError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: maintenanceData,
      vehicleId,
      type,
      predictive,
      message: `Maintenance data retrieved from ${provider}`,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Maintenance API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch maintenance data',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    }, { status: 500 });
  }
}

// Schedule maintenance
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      vehicleId, 
      type, 
      description, 
      scheduledDate, 
      provider = 'fleetio',
      costEstimate,
      parts = []
    } = body;

    if (!vehicleId || !type || !description || !scheduledDate) {
      return NextResponse.json({
        success: false,
        error: 'Vehicle ID, type, description, and scheduled date are required',
        timestamp: new Date()
      }, { status: 400 });
    }

    // Create maintenance record
    const maintenanceRecord = await prisma.maintenanceRecord.create({
      data: {
        vehicleId,
        type,
        description,
        cost: costEstimate || 0,
        serviceDate: new Date(scheduledDate),
        provider,
        status: 'scheduled',
        parts,
        predictive: false
      }
    });

    // Create alert for upcoming maintenance
    await prisma.alert.create({
      data: {
        vehicleId,
        type: 'maintenance',
        severity: 'medium',
        title: 'Maintenance Scheduled',
        message: `${type} maintenance scheduled for ${new Date(scheduledDate).toLocaleDateString()}`,
        data: {
          maintenanceId: maintenanceRecord.id,
          type,
          scheduledDate,
          costEstimate
        },
        provider
      }
    });

    return NextResponse.json({
      success: true,
      data: maintenanceRecord,
      message: 'Maintenance scheduled successfully',
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Maintenance scheduling error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to schedule maintenance',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    }, { status: 500 });
  }
}

// Update maintenance record
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      maintenanceId, 
      status, 
      actualCost, 
      completedDate, 
      notes,
      parts = []
    } = body;

    if (!maintenanceId) {
      return NextResponse.json({
        success: false,
        error: 'Maintenance ID is required',
        timestamp: new Date()
      }, { status: 400 });
    }

    // Update maintenance record
    const updatedRecord = await prisma.maintenanceRecord.update({
      where: { id: maintenanceId },
      data: {
        status: status || 'completed',
        cost: actualCost || undefined,
        serviceDate: completedDate ? new Date(completedDate) : undefined,
        parts: parts.length > 0 ? parts : undefined,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedRecord,
      message: 'Maintenance record updated successfully',
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Maintenance update error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update maintenance record',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    }, { status: 500 });
  }
}
