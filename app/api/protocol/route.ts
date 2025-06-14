
// Fleetopia.co - Standard Protocol Validation API
// Protocol Compliance and Validation for Transport Paradise

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ProtocolCompliance } from '@/lib/types';

export const dynamic = "force-dynamic";

// PROTOCOL VALIDATION MANAGEMENT
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const compliance = searchParams.get('compliance') as ProtocolCompliance;
    const limit = parseInt(searchParams.get('limit') || '20');

    const whereClause: any = {};
    
    if (agentId) {
      whereClause.agentId = agentId;
    }

    const validations = await prisma.protocolValidation.findMany({
      where: whereClause,
      include: {
        agent: {
          select: {
            name: true,
            type: true,
            protocolCompliance: true,
            confidenceScore: true,
            treeLayer: true,
            usbcCompatibility: true
          }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: limit
    });

    // Get protocol compliance summary
    const complianceSummary = await prisma.aIAgent.groupBy({
      by: ['protocolCompliance'],
      _count: {
        protocolCompliance: true
      },
      _avg: {
        confidenceScore: true
      }
    });

    // Calculate protocol health metrics
    const totalAgents = await prisma.aIAgent.count();
    const fullCompliantAgents = await prisma.aIAgent.count({
      where: { protocolCompliance: 'FULL' }
    });
    const mcpCompatibleAgents = await prisma.aIAgent.count({
      where: { usbcCompatibility: true }
    });

    const avgValidationScore = await prisma.protocolValidation.aggregate({
      _avg: {
        validationScore: true
      }
    });

    return NextResponse.json({
      success: true,
      data: validations,
      metadata: {
        total_validations: validations.length,
        compliance_rate: totalAgents > 0 ? (fullCompliantAgents / totalAgents) * 100 : 0,
        mcp_compatibility_rate: totalAgents > 0 ? (mcpCompatibleAgents / totalAgents) * 100 : 0,
        avg_validation_score: avgValidationScore._avg.validationScore || 0,
        compliance_distribution: complianceSummary,
        protocol_health: {
          full_compliance: fullCompliantAgents,
          partial_compliance: complianceSummary.find(c => c.protocolCompliance === 'PARTIAL')?._count.protocolCompliance || 0,
          pending_compliance: complianceSummary.find(c => c.protocolCompliance === 'PENDING')?._count.protocolCompliance || 0,
          failed_compliance: complianceSummary.find(c => c.protocolCompliance === 'FAILED')?._count.protocolCompliance || 0,
          mcp_ready_agents: mcpCompatibleAgents
        }
      },
      protocolVersion: '2.0',
      confidenceScore: 0.99,
      transparencyLog: {
        calculation_steps: 'Protocol validation data aggregation and compliance analysis',
        data_sources: ['protocol_validations', 'agent_compliance_status', 'mcp_compatibility'],
        validation_criteria: ['input_format', 'output_format', 'confidence_scoring', 'transparency_logging', 'data_contribution']
      }
    });
  } catch (error) {
    console.error('Error fetching protocol data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch protocol validation data',
        protocolVersion: '2.0',
        confidenceScore: 0.0
      },
      { status: 500 }
    );
  }
}

// VALIDATE AGENT PROTOCOL COMPLIANCE
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, validationType = 'full_compliance_check', strictMode = true } = body;

    if (!agentId) {
      return NextResponse.json({
        success: false,
        error: 'Agent ID is required for protocol validation',
        protocolVersion: '2.0',
        confidenceScore: 0.0
      }, { status: 400 });
    }

    // Get agent data
    const agent = await prisma.aIAgent.findUnique({
      where: { id: agentId }
    });

    if (!agent) {
      return NextResponse.json({
        success: false,
        error: 'Agent not found',
        protocolVersion: '2.0',
        confidenceScore: 0.0
      }, { status: 404 });
    }

    // Perform validation checks
    const validationResults = {
      inputValid: !!agent.standardInput && typeof agent.standardInput === 'object',
      outputValid: !!agent.standardOutput && typeof agent.standardOutput === 'object',
      confidenceValid: agent.confidenceScore >= 0.8,
      transparencyValid: !!agent.transparencyLog && typeof agent.transparencyLog === 'object',
      dataContributed: !!agent.dataContribution && typeof agent.dataContribution === 'object'
    };

    // Calculate validation score
    const validationScore = Object.values(validationResults).filter(Boolean).length / Object.keys(validationResults).length;

    // Determine compliance level
    let compliance: ProtocolCompliance;
    if (validationScore >= 1.0) {
      compliance = 'FULL';
    } else if (validationScore >= 0.8) {
      compliance = 'PARTIAL';
    } else if (validationScore >= 0.5) {
      compliance = 'PENDING';
    } else {
      compliance = 'FAILED';
    }

    // Generate warnings and errors
    const warnings: string[] = [];
    const errors: string[] = [];

    if (!validationResults.inputValid) {
      errors.push('Standard input format is missing or invalid');
    }
    if (!validationResults.outputValid) {
      errors.push('Standard output format is missing or invalid');
    }
    if (!validationResults.confidenceValid) {
      warnings.push('Confidence score below recommended threshold (0.8)');
    }
    if (!validationResults.transparencyValid) {
      warnings.push('Transparency logging is incomplete or missing');
    }
    if (!validationResults.dataContributed) {
      warnings.push('Data contribution to marketplace is not configured');
    }

    // Create validation record
    const validation = await prisma.protocolValidation.create({
      data: {
        agentId,
        ...validationResults,
        validationScore,
        errors: errors.length > 0 ? errors : null,
        warnings: warnings.length > 0 ? warnings : null
      }
    });

    // Update agent compliance status
    await prisma.aIAgent.update({
      where: { id: agentId },
      data: {
        protocolCompliance: compliance
      }
    });

    // Generate recommendations
    const recommendations: string[] = [];
    if (compliance !== 'FULL') {
      if (!validationResults.inputValid) {
        recommendations.push('Implement standard input format according to Transport Paradise Protocol v2.0');
      }
      if (!validationResults.outputValid) {
        recommendations.push('Implement standard output format with confidence scoring and transparency logging');
      }
      if (!validationResults.confidenceValid) {
        recommendations.push('Improve confidence scoring mechanism to achieve minimum 0.8 threshold');
      }
      if (!validationResults.transparencyValid) {
        recommendations.push('Enhance transparency logging with detailed calculation steps and decision factors');
      }
      if (!validationResults.dataContributed) {
        recommendations.push('Configure data contribution mechanism to share insights with the marketplace');
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        validation,
        compliance,
        validationScore,
        results: validationResults,
        recommendations,
        agent: {
          id: agent.id,
          name: agent.name,
          type: agent.type,
          current_compliance: compliance,
          confidence_score: agent.confidenceScore,
          mcp_compatible: agent.usbcCompatibility
        }
      },
      message: compliance === 'FULL' 
        ? `✅ Agent ${agent.name} is fully compliant with Transport Paradise Protocol v2.0!`
        : `⚠️ Agent ${agent.name} requires improvements for full protocol compliance`,
      protocolVersion: '2.0',
      confidenceScore: validationScore,
      transparencyLog: {
        validation_type: validationType,
        strict_mode: strictMode,
        calculation_steps: 'Input validation, output validation, confidence check, transparency check, data contribution check',
        compliance_criteria: ['standard_io_format', 'confidence_threshold', 'transparency_logging', 'data_sharing'],
        paradise_impact: compliance === 'FULL' ? 'positive' : 'improvement_needed'
      }
    });
  } catch (error) {
    console.error('Error validating protocol compliance:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to validate protocol compliance',
        protocolVersion: '2.0',
        confidenceScore: 0.0
      },
      { status: 500 }
    );
  }
}
