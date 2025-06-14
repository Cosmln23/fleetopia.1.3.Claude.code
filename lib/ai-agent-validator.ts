import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ValidationResult {
  valid: boolean;
  score: number;
  errors: string[];
  warnings: string[];
  recommendations: string[];
  performance: {
    accuracy: number;
    speed: number;
    reliability: number;
    security: number;
  };
}

export interface AIAgentValidationData {
  name: string;
  description: string;
  version: string;
  category: string;
  capabilities: any;
  configuration: any;
  performance: any;
  requiresAPI: string[];
  code?: string;
  endpoints?: any[];
}

export class AIAgentValidator {
  
  // Validare structură de bază
  async validateStructure(agent: AIAgentValidationData): Promise<Partial<ValidationResult>> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Validări obligatorii
    if (!agent.name || agent.name.length < 3) {
      errors.push('Agent name must be at least 3 characters long');
      score -= 15;
    }

    if (!agent.description || agent.description.length < 10) {
      errors.push('Agent description must be at least 10 characters long');
      score -= 10;
    }

    if (!agent.category) {
      errors.push('Agent category is required');
      score -= 10;
    }

    if (!agent.version || !this.isValidVersion(agent.version)) {
      errors.push('Valid version number is required (e.g., 1.0.0)');
      score -= 5;
    }

    // Validări capabilități
    if (!agent.capabilities || Object.keys(agent.capabilities).length === 0) {
      errors.push('Agent must define at least one capability');
      score -= 20;
    }

    // Validări configurație
    if (!agent.configuration) {
      warnings.push('No configuration provided - agent may not function properly');
      score -= 5;
    }

    // Validări API requirements
    if (!agent.requiresAPI || agent.requiresAPI.length === 0) {
      recommendations.push('Consider specifying required API types for better marketplace visibility');
    }

    // Check name uniqueness
    const existingAgent = await prisma.aIAgent.findFirst({
      where: { 
        name: agent.name,
        status: 'active'
      }
    });

    if (existingAgent) {
      warnings.push('An agent with this name already exists - consider using a unique name');
      score -= 5;
    }

    return {
      valid: errors.length === 0,
      score: Math.max(0, score),
      errors,
      warnings,
      recommendations
    };
  }

  // Testare performanță
  async testPerformance(agent: AIAgentValidationData): Promise<Partial<ValidationResult>> {
    const performance = {
      accuracy: 0,
      speed: 0,
      reliability: 0,
      security: 0
    };

    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    try {
      // Simulare teste de performanță
      
      // Test accuracy (based on capabilities and configuration)
      performance.accuracy = this.calculateAccuracyScore(agent);
      
      // Test speed (based on configuration complexity)
      performance.speed = this.calculateSpeedScore(agent);
      
      // Test reliability (based on error handling and validation)
      performance.reliability = this.calculateReliabilityScore(agent);
      
      // Test security (based on configuration and permissions)
      performance.security = this.calculateSecurityScore(agent);

      // Generate warnings based on performance
      if (performance.accuracy < 70) {
        warnings.push('Low accuracy score - consider improving agent logic');
      }
      if (performance.speed < 60) {
        warnings.push('Performance may be slow - optimize configuration');
      }
      if (performance.reliability < 80) {
        warnings.push('Reliability concerns - add more error handling');
      }
      if (performance.security < 90) {
        errors.push('Security issues detected - review permissions and data handling');
      }

      // Recommendations
      if (performance.accuracy > 90 && performance.speed > 85) {
        recommendations.push('Excellent performance! Consider adding to marketplace');
      }

    } catch (error) {
      errors.push(`Performance testing failed: ${error}`);
    }

    const avgScore = (performance.accuracy + performance.speed + performance.reliability + performance.security) / 4;

    return {
      valid: errors.length === 0 && avgScore >= 70,
      score: avgScore,
      errors,
      warnings,
      recommendations,
      performance
    };
  }

  // Verificare securitate
  async checkSecurity(agent: AIAgentValidationData): Promise<Partial<ValidationResult>> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check for sensitive data in configuration
    const configStr = JSON.stringify(agent.configuration || {}).toLowerCase();
    const sensitiveKeywords = ['password', 'secret', 'key', 'token', 'private'];
    
    sensitiveKeywords.forEach(keyword => {
      if (configStr.includes(keyword)) {
        errors.push(`Potential sensitive data found in configuration: ${keyword}`);
        score -= 20;
      }
    });

    // Check API requirements security
    if (agent.requiresAPI && agent.requiresAPI.includes('admin')) {
      warnings.push('Agent requires admin access - ensure proper authorization');
      score -= 10;
    }

    // Check for proper data validation
    if (!agent.configuration?.validation) {
      warnings.push('No input validation detected - consider adding validation rules');
      score -= 5;
    }

    // Check for rate limiting
    if (!agent.configuration?.rateLimiting) {
      recommendations.push('Consider adding rate limiting to prevent abuse');
    }

    // Check for audit logging
    if (!agent.configuration?.auditLog) {
      recommendations.push('Consider adding audit logging for security compliance');
    }

    return {
      valid: errors.length === 0,
      score: Math.max(0, score),
      errors,
      warnings,
      recommendations
    };
  }

  // Validare completă
  async validateAgent(agent: AIAgentValidationData): Promise<ValidationResult> {
    const [structure, performance, security] = await Promise.all([
      this.validateStructure(agent),
      this.testPerformance(agent),
      this.checkSecurity(agent)
    ]);

    const allErrors = [
      ...(structure.errors || []),
      ...(performance.errors || []),
      ...(security.errors || [])
    ];

    const allWarnings = [
      ...(structure.warnings || []),
      ...(performance.warnings || []),
      ...(security.warnings || [])
    ];

    const allRecommendations = [
      ...(structure.recommendations || []),
      ...(performance.recommendations || []),
      ...(security.recommendations || [])
    ];

    const overallScore = [
      structure.score || 0,
      performance.score || 0,
      security.score || 0
    ].reduce((a, b) => a + b, 0) / 3;

    return {
      valid: allErrors.length === 0 && overallScore >= 70,
      score: overallScore,
      errors: allErrors,
      warnings: allWarnings,
      recommendations: allRecommendations,
      performance: performance.performance || {
        accuracy: 0,
        speed: 0,
        reliability: 0,
        security: 0
      }
    };
  }

  // Helper methods
  private isValidVersion(version: string): boolean {
    return /^\d+\.\d+\.\d+$/.test(version);
  }

  private calculateAccuracyScore(agent: AIAgentValidationData): number {
    let score = 80; // Base score
    
    // Bonus for detailed capabilities
    if (agent.capabilities && Object.keys(agent.capabilities).length > 3) {
      score += 10;
    }
    
    // Bonus for performance metrics
    if (agent.performance && agent.performance.accuracy) {
      score += 10;
    }
    
    return Math.min(100, score);
  }

  private calculateSpeedScore(agent: AIAgentValidationData): number {
    let score = 85; // Base score
    
    // Penalty for complex configuration
    if (agent.configuration && Object.keys(agent.configuration).length > 10) {
      score -= 15;
    }
    
    // Bonus for optimization settings
    if (agent.configuration?.optimization) {
      score += 15;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  private calculateReliabilityScore(agent: AIAgentValidationData): number {
    let score = 75; // Base score
    
    // Bonus for error handling
    if (agent.configuration?.errorHandling) {
      score += 15;
    }
    
    // Bonus for retry logic
    if (agent.configuration?.retryPolicy) {
      score += 10;
    }
    
    return Math.min(100, score);
  }

  private calculateSecurityScore(agent: AIAgentValidationData): number {
    let score = 90; // Base score (security is critical)
    
    // Check for security configuration
    if (!agent.configuration?.security) {
      score -= 20;
    }
    
    // Check for data encryption
    if (agent.configuration?.encryption) {
      score += 10;
    }
    
    return Math.max(0, Math.min(100, score));
  }
}

// Export singleton instance
export const aiAgentValidator = new AIAgentValidator(); 