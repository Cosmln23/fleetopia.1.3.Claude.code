
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Traffic APIs - TomTom, INRIX, Waze integration
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider') || 'tomtom';
    const routeId = searchParams.get('routeId');
    const lat = parseFloat(searchParams.get('lat') || '40.7128');
    const lng = parseFloat(searchParams.get('lng') || '-74.0060');
    const radius = parseInt(searchParams.get('radius') || '10'); // km

    // Mock traffic data based on research
    const mockTrafficData = {
      tomtom: {
        provider: 'tomtom',
        updateFrequency: '30_seconds',
        coverage: '80_countries',
        incidents: [
          {
            incidentId: `TT-${Date.now()}-001`,
            type: 'accident',
            severity: 'high',
            location: { lat: lat + 0.01, lng: lng + 0.01, address: 'I-95 Northbound, Mile 45' },
            description: 'Multi-vehicle accident blocking 2 lanes',
            startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
            estimatedClearTime: new Date(Date.now() + 1 * 60 * 60 * 1000),
            impact: {
              delayMinutes: 25,
              affectedLanes: 2,
              totalLanes: 4,
              alternativeRoute: true
            }
          },
          {
            incidentId: `TT-${Date.now()}-002`,
            type: 'construction',
            severity: 'medium',
            location: { lat: lat - 0.02, lng: lng - 0.01, address: 'Route 1 Southbound, Mile 12' },
            description: 'Lane closure for road maintenance',
            startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
            estimatedClearTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            impact: {
              delayMinutes: 10,
              affectedLanes: 1,
              totalLanes: 3,
              alternativeRoute: true
            }
          }
        ],
        flow: {
          averageSpeed: 45, // km/h
          freeFlowSpeed: 65,
          congestionLevel: 0.3, // 0-1 scale
          travelTimeIndex: 1.4, // compared to free flow
          reliability: 0.85
        },
        alerts: [
          {
            type: 'heavy_traffic',
            severity: 'medium',
            message: 'Heavy traffic detected on main route',
            estimatedDelay: 15,
            alternativeAvailable: true
          }
        ]
      },
      inrix: {
        provider: 'inrix',
        updateFrequency: '1_minute',
        coverage: '50_countries',
        incidents: [
          {
            incidentId: `IX-${Date.now()}-001`,
            type: 'weather',
            severity: 'high',
            location: { lat: lat + 0.005, lng: lng - 0.005, address: 'Highway 101, Mile 23' },
            description: 'Heavy rain causing reduced visibility',
            startTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
            estimatedClearTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
            impact: {
              delayMinutes: 20,
              speedReduction: 30,
              visibilityKm: 2
            }
          }
        ],
        flow: {
          averageSpeed: 42,
          freeFlowSpeed: 65,
          congestionLevel: 0.35,
          travelTimeIndex: 1.5,
          reliability: 0.88
        },
        alerts: [
          {
            type: 'weather_impact',
            severity: 'high',
            message: 'Weather conditions affecting traffic flow',
            estimatedDelay: 20,
            safetyRecommendation: 'Reduce speed and increase following distance'
          }
        ]
      },
      waze: {
        provider: 'waze',
        updateFrequency: '2_minutes',
        coverage: 'crowd_sourced',
        incidents: [
          {
            incidentId: `WZ-${Date.now()}-001`,
            type: 'police',
            severity: 'low',
            location: { lat: lat - 0.01, lng: lng + 0.02, address: 'Main Street, near City Hall' },
            description: 'Police activity reported by drivers',
            startTime: new Date(Date.now() - 30 * 60 * 1000),
            reportedBy: 'community',
            confidence: 0.75,
            impact: {
              delayMinutes: 5,
              speedReduction: 15
            }
          },
          {
            incidentId: `WZ-${Date.now()}-002`,
            type: 'hazard',
            severity: 'medium',
            location: { lat: lat + 0.015, lng: lng - 0.01, address: 'Bridge Road, near Exit 15' },
            description: 'Object on road reported',
            startTime: new Date(Date.now() - 15 * 60 * 1000),
            reportedBy: 'community',
            confidence: 0.65,
            impact: {
              delayMinutes: 8,
              laneBlocked: true
            }
          }
        ],
        flow: {
          averageSpeed: 38,
          freeFlowSpeed: 60,
          congestionLevel: 0.4,
          travelTimeIndex: 1.6,
          reliability: 0.75,
          communityReports: 23
        },
        alerts: [
          {
            type: 'community_alert',
            severity: 'medium',
            message: 'Multiple hazards reported by community',
            reportsCount: 5,
            lastReported: new Date(Date.now() - 10 * 60 * 1000)
          }
        ]
      }
    };

    const trafficData = mockTrafficData[provider as keyof typeof mockTrafficData] || mockTrafficData.tomtom;

    // Calculate ETA based on traffic conditions
    const baseDistance = 50; // km
    const eta = Math.round((baseDistance / trafficData.flow.averageSpeed) * 60); // minutes

    const responseData = {
      ...trafficData,
      routeId,
      location: { lat, lng },
      radius,
      eta,
      timestamp: new Date()
    };

    // Store traffic data in database
    try {
      await prisma.trafficData.create({
        data: {
          routeId,
          provider: trafficData.provider,
          incidents: trafficData.incidents,
          flow: trafficData.flow,
          congestion: trafficData.flow.congestionLevel,
          eta,
          alerts: trafficData.alerts,
          timestamp: new Date()
        }
      });

      // Store individual incidents
      for (const incident of trafficData.incidents) {
        await prisma.trafficIncident.create({
          data: {
            incidentId: incident.incidentId,
            provider: trafficData.provider,
            type: incident.type,
            severity: incident.severity,
            location: incident.location,
            description: incident.description,
            startTime: incident.startTime,
            endTime: incident.estimatedClearTime || null,
            impact: incident.impact
          }
        });

        // Generate alerts for high severity incidents
        if (incident.severity === 'high') {
          await prisma.alert.create({
            data: {
              type: 'traffic',
              severity: 'high',
              title: `${incident.type.toUpperCase()} Alert`,
              message: incident.description,
              data: {
                incident,
                eta: eta,
                delayMinutes: incident.impact.delayMinutes || 0
              },
              provider: trafficData.provider
            }
          });
        }
      }

    } catch (dbError) {
      console.warn('Failed to store traffic data:', dbError);
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      message: `Traffic data retrieved from ${provider}`,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Traffic API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch traffic data',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    }, { status: 500 });
  }
}

// Real-time traffic updates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { routeId, provider = 'tomtom' } = body;

    if (!routeId) {
      return NextResponse.json({
        success: false,
        error: 'Route ID is required',
        timestamp: new Date()
      }, { status: 400 });
    }

    // Mock real-time traffic update
    const trafficUpdate = {
      routeId,
      provider,
      congestionLevel: Math.random() * 0.8,
      averageSpeed: Math.floor(Math.random() * 40) + 30,
      incidents: Math.random() > 0.7 ? 1 : 0,
      eta: Math.floor(Math.random() * 60) + 30,
      lastUpdate: new Date(),
      reliability: 0.85 + Math.random() * 0.1
    };

    // Update traffic data
    await prisma.trafficData.create({
      data: {
        routeId,
        provider,
        incidents: [],
        flow: {
          averageSpeed: trafficUpdate.averageSpeed,
          congestionLevel: trafficUpdate.congestionLevel,
          reliability: trafficUpdate.reliability
        },
        congestion: trafficUpdate.congestionLevel,
        eta: trafficUpdate.eta,
        alerts: [],
        timestamp: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: trafficUpdate,
      message: 'Traffic data updated',
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Traffic update error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update traffic data',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    }, { status: 500 });
  }
}
