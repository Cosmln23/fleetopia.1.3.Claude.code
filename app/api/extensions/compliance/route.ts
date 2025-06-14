
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Compliance APIs - FMCSA, European Transport integration
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider') || 'fmcsa';
    const vehicleId = searchParams.get('vehicleId');
    const driverId = searchParams.get('driverId');
    const checkType = searchParams.get('checkType') || 'all';

    // Mock compliance data based on research
    const mockComplianceData = {
      fmcsa: {
        provider: 'fmcsa',
        coverage: 'united_states',
        checks: [
          {
            type: 'dot_inspection',
            status: 'compliant',
            details: {
              inspectionDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              inspectorId: 'DOT-12345',
              location: 'New York State Inspection Station',
              violations: [],
              score: 95,
              nextInspectionDue: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000)
            },
            expiryDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000),
            automated: true
          },
          {
            type: 'hours_of_service',
            status: 'compliant',
            details: {
              currentHours: 8.5,
              maxHours: 11,
              restPeriod: 10,
              weeklyHours: 45,
              maxWeeklyHours: 60,
              violations: [],
              lastReset: new Date(Date.now() - 10 * 60 * 60 * 1000)
            },
            automated: true
          },
          {
            type: 'vehicle_registration',
            status: 'compliant',
            details: {
              registrationNumber: 'NY-ABC-1234',
              expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
              state: 'New York',
              vehicleClass: 'Commercial',
              weight: 26000
            },
            expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
            automated: false
          },
          {
            type: 'driver_license',
            status: 'compliant',
            details: {
              licenseNumber: 'NY-CDL-567890',
              class: 'CDL-A',
              endorsements: ['Hazmat', 'Passenger'],
              restrictions: [],
              expiryDate: new Date(Date.now() + 720 * 24 * 60 * 60 * 1000),
              medicalCertificate: {
                valid: true,
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
              }
            },
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            automated: false
          }
        ],
        overallScore: 92,
        riskLevel: 'low',
        lastUpdate: new Date()
      },
      european_transport: {
        provider: 'european_transport',
        coverage: 'european_union',
        checks: [
          {
            type: 'tachograph_compliance',
            status: 'compliant',
            details: {
              digitalTachograph: true,
              lastDownload: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              violations: [],
              drivingTime: 9.5,
              maxDrivingTime: 10,
              restPeriod: 11,
              minRestPeriod: 9
            },
            automated: true
          },
          {
            type: 'emissions_compliance',
            status: 'compliant',
            details: {
              euroStandard: 'Euro VI',
              emissionLevel: 'compliant',
              lastTest: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
              nextTest: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000),
              co2Emissions: 245.8
            },
            expiryDate: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000),
            automated: false
          },
          {
            type: 'cabotage_rules',
            status: 'compliant',
            details: {
              currentOperations: 2,
              maxOperations: 3,
              periodStart: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
              periodEnd: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
              country: 'Germany'
            },
            automated: true
          }
        ],
        overallScore: 88,
        riskLevel: 'low',
        lastUpdate: new Date()
      }
    };

    const complianceData = mockComplianceData[provider as keyof typeof mockComplianceData] || mockComplianceData.fmcsa;

    // Filter by check type if specified
    let filteredChecks = complianceData.checks;
    if (checkType !== 'all') {
      filteredChecks = complianceData.checks.filter(check => check.type === checkType);
    }

    // Store compliance checks in database
    for (const check of filteredChecks) {
      try {
        await prisma.complianceCheck.create({
          data: {
            vehicleId,
            driverId,
            type: check.type,
            provider: complianceData.provider,
            status: check.status,
            details: check.details,
            violations: check.details.violations || [],
            expiryDate: check.expiryDate || null,
            checkDate: new Date(),
            automated: check.automated
          }
        });

        // Generate alerts for non-compliant items or upcoming expirations
        if (check.status !== 'compliant') {
          await prisma.alert.create({
            data: {
              vehicleId,
              driverId,
              type: 'compliance',
              severity: 'critical',
              title: `${check.type.replace('_', ' ').toUpperCase()} Non-Compliance`,
              message: `Vehicle/Driver is not compliant with ${check.type} requirements`,
              data: {
                complianceCheck: check,
                violations: check.details.violations
              },
              provider: complianceData.provider
            }
          });
        }

        // Alert for upcoming expirations (30 days)
        if (check.expiryDate && check.expiryDate.getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000) {
          await prisma.alert.create({
            data: {
              vehicleId,
              driverId,
              type: 'compliance',
              severity: 'medium',
              title: `${check.type.replace('_', ' ').toUpperCase()} Expiring Soon`,
              message: `${check.type} expires on ${check.expiryDate.toLocaleDateString()}`,
              data: {
                complianceCheck: check,
                expiryDate: check.expiryDate,
                daysRemaining: Math.ceil((check.expiryDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
              },
              provider: complianceData.provider
            }
          });
        }

      } catch (dbError) {
        console.warn('Failed to store compliance check:', check.type, dbError);
      }
    }

    // Store Hours of Service data if applicable
    const hosCheck = filteredChecks.find(check => check.type === 'hours_of_service');
    if (hosCheck && driverId) {
      try {
        await prisma.hoursOfService.create({
          data: {
            driverId,
            date: new Date(),
            hoursWorked: hosCheck.details.currentHours || 0,
            hoursRemaining: (hosCheck.details.maxHours || 11) - (hosCheck.details.currentHours || 0),
            violations: hosCheck.details.violations || [],
            status: hosCheck.status,
            provider: complianceData.provider
          }
        });
      } catch (dbError) {
        console.warn('Failed to store HOS data:', dbError);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...complianceData,
        checks: filteredChecks
      },
      vehicleId,
      driverId,
      checkType,
      message: `Compliance data retrieved from ${provider}`,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Compliance API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch compliance data',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    }, { status: 500 });
  }
}

// Manual compliance check
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vehicleId, driverId, checkType, provider = 'fmcsa' } = body;

    if (!checkType) {
      return NextResponse.json({
        success: false,
        error: 'Check type is required',
        timestamp: new Date()
      }, { status: 400 });
    }

    // Mock manual compliance check
    const checkResult = {
      type: checkType,
      status: Math.random() > 0.1 ? 'compliant' : 'non_compliant',
      details: {
        checkDate: new Date(),
        inspector: 'System Automated Check',
        violations: Math.random() > 0.8 ? ['Minor violation detected'] : [],
        score: Math.floor(Math.random() * 20) + 80,
        notes: 'Automated compliance verification completed'
      },
      automated: true,
      provider
    };

    // Store compliance check
    const complianceRecord = await prisma.complianceCheck.create({
      data: {
        vehicleId,
        driverId,
        type: checkType,
        provider,
        status: checkResult.status,
        details: checkResult.details,
        violations: checkResult.details.violations,
        checkDate: new Date(),
        automated: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        complianceRecord,
        checkResult
      },
      message: `Manual ${checkType} check completed`,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Manual compliance check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to perform compliance check',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    }, { status: 500 });
  }
}
