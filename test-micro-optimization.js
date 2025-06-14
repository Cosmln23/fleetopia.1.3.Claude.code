// ⚡ Micro-Optimization Test Suite - PROMPT 3 Implementation
// Comprehensive testing pentru Micro-Optimization Fuel Engine

const BASE_URL = 'http://localhost:3004'; // Update port as needed

console.log('⚡ Starting Micro-Optimization Fuel Engine Test Suite...\n');

// Test configuration
const TEST_CONFIG = {
  maxRetries: 3,
  timeoutMs: 10000,
  expectedResponseTime: 5000,
  minimumEfficiencyGain: 0.05, // 5%
  acceptableAccuracy: 0.80, // 80%
};

// Test results tracking
let testResults = {
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  performance: {
    averageResponseTime: 0,
    maxResponseTime: 0,
    minResponseTime: Infinity
  }
};

// Utility functions
async function makeRequest(endpoint, options = {}) {
  const startTime = Date.now();
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      timeout: TEST_CONFIG.timeoutMs,
      ...options
    });
    
    const responseTime = Date.now() - startTime;
    updatePerformanceMetrics(responseTime);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { success: true, data, responseTime };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    updatePerformanceMetrics(responseTime);
    return { success: false, error: error.message, responseTime };
  }
}

function updatePerformanceMetrics(responseTime) {
  const perf = testResults.performance;
  perf.maxResponseTime = Math.max(perf.maxResponseTime, responseTime);
  perf.minResponseTime = Math.min(perf.minResponseTime, responseTime);
  
  const totalTests = testResults.totalTests || 1;
  perf.averageResponseTime = ((perf.averageResponseTime * (totalTests - 1)) + responseTime) / totalTests;
}

function logTest(testName, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} - ${testName}${details ? ': ' + details : ''}`);
  
  testResults.totalTests++;
  if (passed) {
    testResults.passedTests++;
  } else {
    testResults.failedTests++;
  }
}

// === TEST 1: System Status ===
async function testSystemStatus() {
  console.log('\n🔧 Testing System Status:');
  console.log('─'.repeat(50));
  
  try {
    const result = await makeRequest('/api/micro-optimization?action=system_status');
    
    if (result.success && result.data) {
      const status = result.data;
      
      const isOperational = status.status === 'operational';
      logTest('System Status Check', isOperational, `Status: ${status.status}`);
      
      const components = status.components || {};
      const activeComponents = Object.keys(components).length;
      logTest('Component Health Check', activeComponents >= 3, `${activeComponents} components active`);
      
      const responseTimeOk = result.responseTime < TEST_CONFIG.expectedResponseTime;
      logTest('Response Time Check', responseTimeOk, `${result.responseTime}ms`);
      
      return true;
    } else {
      logTest('System Status API', false, result.error || 'No data received');
      return false;
    }
  } catch (error) {
    logTest('System Status Test', false, error.message);
    return false;
  }
}

// === TEST 2: Real-time Optimization Start ===
async function testRealTimeOptimization() {
  console.log('\n🔧 Testing Real-time Optimization:');
  console.log('─'.repeat(50));
  
  try {
    const requestBody = {
      action: 'start_real_time_optimization',
      vehicleId: 'TRUCK_001',
      coachingLevel: 'moderate',
      optimizationThreshold: 0.02
    };
    
    const result = await makeRequest('/api/micro-optimization', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    if (result.success && result.data) {
      const session = result.data;
      
      const hasSessionId = session.sessionId && session.sessionId.startsWith('session_');
      logTest('Session Creation', hasSessionId, 
        hasSessionId ? `Session ID: ${session.sessionId}` : 'Missing session ID');
      
      const hasConfiguration = session.configuration && session.configuration.coachingLevel;
      logTest('Configuration Setup', hasConfiguration, 
        hasConfiguration ? `Coaching: ${session.configuration.coachingLevel}` : 'Missing configuration');
      
      const statusActive = session.status === 'active';
      logTest('Optimization Status', statusActive, 
        `Status: ${session.status}`);
      
      return true;
    } else {
      logTest('Real-time Optimization Request', false, result.error || 'No data');
      return false;
    }
  } catch (error) {
    logTest('Real-time Optimization Test', false, error.message);
    return false;
  }
}

// === TEST 3: Driving Behavior Analysis ===
async function testDrivingBehaviorAnalysis() {
  console.log('\n🔧 Testing Driving Behavior Analysis:');
  console.log('─'.repeat(50));
  
  try {
    const vehicleData = {
      timestamp: new Date(),
      speed: 65,
      acceleration: 0.5,
      throttlePosition: 45,
      brakePosition: 0,
      engineRPM: 2200,
      fuelFlowRate: 12.5,
      gearPosition: 4,
      engineTemp: 95,
      batteryLevel: 75,
      regenerativeBraking: 0
    };

    const requestBody = {
      action: 'analyze_driving_behavior',
      vehicleData: vehicleData
    };
    
    const result = await makeRequest('/api/micro-optimization', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    if (result.success && result.data) {
      const analysis = result.data;
      
      const hasBehaviorAnalysis = analysis.behaviorAnalysis && analysis.behaviorAnalysis.overallEfficiencyScore;
      logTest('Behavior Analysis Structure', hasBehaviorAnalysis, 
        hasBehaviorAnalysis ? `Score: ${(analysis.behaviorAnalysis.overallEfficiencyScore * 100).toFixed(1)}%` : 'Missing analysis');
      
      if (hasBehaviorAnalysis) {
        const score = analysis.behaviorAnalysis.overallEfficiencyScore;
        const reasonableScore = score >= 0 && score <= 1;
        logTest('Efficiency Score Validity', reasonableScore, 
          `Score: ${(score * 100).toFixed(1)}%`);
        
        const hasInsights = analysis.insights && analysis.insights.overallScore;
        logTest('Insights Generation', hasInsights, 
          hasInsights ? `Insights available` : 'Missing insights');
      }
      
      return true;
    } else {
      logTest('Behavior Analysis Request', false, result.error || 'No data');
      return false;
    }
  } catch (error) {
    logTest('Driving Behavior Analysis Test', false, error.message);
    return false;
  }
}

// === TEST 4: Micro-optimization Generation ===
async function testMicroOptimizationGeneration() {
  console.log('\n🔧 Testing Micro-optimization Generation:');
  console.log('─'.repeat(50));
  
  try {
    const vehicleProfile = {
      id: 'TRUCK_001',
      technicalSpecs: {
        type: 'standard',
        engine: { displacement: 2.0, type: 'gasoline' },
        transmission: 'automatic'
      }
    };

    const requestBody = {
      action: 'generate_micro_optimizations',
      vehicleProfile: vehicleProfile
    };
    
    const result = await makeRequest('/api/micro-optimization', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    if (result.success && result.data) {
      const optimizations = result.data;
      
      const hasMicroOptimizations = optimizations.microOptimizations && optimizations.microOptimizations.optimizations;
      logTest('Micro-optimization Structure', hasMicroOptimizations, 
        hasMicroOptimizations ? `${optimizations.microOptimizations.optimizations.length} optimizations` : 'Missing optimizations');
      
      if (hasMicroOptimizations) {
        const totalSavings = optimizations.microOptimizations.totalPotentialSavings;
        const reasonableSavings = totalSavings >= 0 && totalSavings <= 0.5;
        logTest('Savings Calculation', reasonableSavings, 
          `${(totalSavings * 100).toFixed(1)}% potential savings`);
        
        const hasVehicleSpecific = optimizations.vehicleSpecificOptimizations && optimizations.vehicleSpecificOptimizations.length > 0;
        logTest('Vehicle-specific Optimizations', hasVehicleSpecific, 
          hasVehicleSpecific ? `${optimizations.vehicleSpecificOptimizations.length} vehicle-specific` : 'No vehicle-specific optimizations');
      }
      
      return true;
    } else {
      logTest('Micro-optimization Request', false, result.error || 'No data');
      return false;
    }
  } catch (error) {
    logTest('Micro-optimization Generation Test', false, error.message);
    return false;
  }
}

// === TEST 5: Real-time Metrics ===
async function testRealTimeMetrics() {
  console.log('\n🔧 Testing Real-time Metrics:');
  console.log('─'.repeat(50));
  
  try {
    const result = await makeRequest('/api/micro-optimization?action=real_time_metrics');
    
    if (result.success && result.data) {
      const metrics = result.data;
      
      const hasSystemStatus = metrics.systemStatus;
      logTest('System Status Availability', hasSystemStatus, 
        `Status: ${metrics.systemStatus || 'unknown'}`);
      
      const hasPerformance = metrics.performance && metrics.performance.systemHealth;
      logTest('Performance Metrics', hasPerformance, 
        hasPerformance ? `Health: ${metrics.performance.systemHealth}` : 'Missing performance data');
      
      const responseTimeOk = result.responseTime < TEST_CONFIG.expectedResponseTime;
      logTest('Metrics Response Time', responseTimeOk, `${result.responseTime}ms`);
      
      return true;
    } else {
      logTest('Real-time Metrics Request', false, result.error || 'No data');
      return false;
    }
  } catch (error) {
    logTest('Real-time Metrics Test', false, error.message);
    return false;
  }
}

// === TEST 6: Driver Coaching Insights ===
async function testDriverCoachingInsights() {
  console.log('\n🔧 Testing Driver Coaching Insights:');
  console.log('─'.repeat(50));
  
  try {
    const result = await makeRequest('/api/micro-optimization?action=driver_coaching_insights&driverId=driver_001');
    
    if (result.success && result.data) {
      const insights = result.data;
      
      const hasDriverId = insights.driverId === 'driver_001';
      logTest('Driver ID Validation', hasDriverId, 
        `Driver ID: ${insights.driverId}`);
      
      const hasEffectiveness = insights.overallEffectiveness !== undefined;
      logTest('Effectiveness Metrics', hasEffectiveness, 
        hasEffectiveness ? `${(insights.overallEffectiveness * 100).toFixed(1)}% effectiveness` : 'Missing effectiveness');
      
      const hasAnalytics = insights.analytics && insights.analytics.improvementRate !== undefined;
      logTest('Analytics Data', hasAnalytics, 
        hasAnalytics ? `${(insights.analytics.improvementRate * 100).toFixed(1)}% improvement rate` : 'Missing analytics');
      
      return true;
    } else {
      logTest('Driver Coaching Request', false, result.error || 'No data');
      return false;
    }
  } catch (error) {
    logTest('Driver Coaching Insights Test', false, error.message);
    return false;
  }
}

// === TEST 7: Vehicle-specific Optimizations ===
async function testVehicleSpecificOptimizations() {
  console.log('\n🔧 Testing Vehicle-specific Optimizations:');
  console.log('─'.repeat(50));
  
  try {
    const result = await makeRequest('/api/micro-optimization?action=vehicle_specific_optimizations&vehicleId=TRUCK_001');
    
    if (result.success && result.data) {
      const vehicleOpts = result.data;
      
      const hasVehicleId = vehicleOpts.vehicleId === 'TRUCK_001';
      logTest('Vehicle ID Validation', hasVehicleId, 
        `Vehicle ID: ${vehicleOpts.vehicleId}`);
      
      const hasOptimizations = vehicleOpts.optimizations && vehicleOpts.optimizations.length > 0;
      logTest('Optimizations Available', hasOptimizations, 
        hasOptimizations ? `${vehicleOpts.optimizations.length} optimizations` : 'No optimizations');
      
      if (hasOptimizations) {
        const totalGain = vehicleOpts.totalPotentialGain;
        const reasonableGain = totalGain >= 0 && totalGain <= 0.5;
        logTest('Total Potential Gain', reasonableGain, 
          `${(totalGain * 100).toFixed(1)}% total gain`);
      }
      
      return true;
    } else {
      logTest('Vehicle Optimizations Request', false, result.error || 'No data');
      return false;
    }
  } catch (error) {
    logTest('Vehicle-specific Optimizations Test', false, error.message);
    return false;
  }
}

// === TEST 8: Settings Update ===
async function testSettingsUpdate() {
  console.log('\n🔧 Testing Settings Update:');
  console.log('─'.repeat(50));
  
  try {
    const requestBody = {
      action: 'update_coaching_settings',
      coachingLevel: 'aggressive',
      samplingRate: 2000,
      optimizationThreshold: 0.03
    };
    
    const result = await makeRequest('/api/micro-optimization', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    if (result.success && result.data) {
      const settings = result.data;
      
      const correctCoaching = settings.coachingLevel === 'aggressive';
      logTest('Coaching Level Update', correctCoaching, 
        `Level: ${settings.coachingLevel}`);
      
      const correctSampling = settings.samplingRate === 2000;
      logTest('Sampling Rate Update', correctSampling, 
        `Rate: ${settings.samplingRate}ms`);
      
      const hasLastUpdated = settings.lastUpdated;
      logTest('Update Timestamp', hasLastUpdated, 
        hasLastUpdated ? 'Timestamp recorded' : 'Missing timestamp');
      
      return true;
    } else {
      logTest('Settings Update Request', false, result.error || 'No data');
      return false;
    }
  } catch (error) {
    logTest('Settings Update Test', false, error.message);
    return false;
  }
}

// === TEST 9: Optimization Effectiveness Tracking ===
async function testOptimizationEffectivenessTracking() {
  console.log('\n🔧 Testing Optimization Effectiveness Tracking:');
  console.log('─'.repeat(50));
  
  try {
    const requestBody = {
      action: 'track_optimization_effectiveness',
      optimizationId: 'opt_12345',
      driverResponse: 'followed'
    };
    
    const result = await makeRequest('/api/micro-optimization', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    if (result.success && result.data) {
      const tracking = result.data;
      
      const hasEffectiveness = tracking.effectiveness && tracking.effectiveness.optimizationId;
      logTest('Effectiveness Tracking', hasEffectiveness, 
        hasEffectiveness ? `ID: ${tracking.effectiveness.optimizationId}` : 'Missing effectiveness data');
      
      if (hasEffectiveness) {
        const effectivenessScore = tracking.effectiveness.effectiveness;
        const validScore = effectivenessScore >= 0 && effectivenessScore <= 1;
        logTest('Effectiveness Score', validScore, 
          `Score: ${(effectivenessScore * 100).toFixed(1)}%`);
      }
      
      return true;
    } else {
      logTest('Effectiveness Tracking Request', false, result.error || 'No data');
      return false;
    }
  } catch (error) {
    logTest('Optimization Effectiveness Tracking Test', false, error.message);
    return false;
  }
}

// === MAIN TEST RUNNER ===
async function runAllTests() {
  console.log('⚡ MICRO-OPTIMIZATION FUEL ENGINE - TEST SUITE');
  console.log('══════════════════════════════════════════════════════════════════════');
  console.log(`🎯 Target URL: ${BASE_URL}`);
  console.log(`⏱️  Timeout: ${TEST_CONFIG.timeoutMs}ms`);
  console.log(`📊 Expected Response Time: <${TEST_CONFIG.expectedResponseTime}ms`);
  console.log('══════════════════════════════════════════════════════════════════════');

  // Run all tests
  await testSystemStatus();
  await testRealTimeOptimization();
  await testDrivingBehaviorAnalysis();
  await testMicroOptimizationGeneration();
  await testRealTimeMetrics();
  await testDriverCoachingInsights();
  await testVehicleSpecificOptimizations();
  await testSettingsUpdate();
  await testOptimizationEffectivenessTracking();

  generateFinalReport();
}

function generateFinalReport() {
  console.log('\n⚡ MICRO-OPTIMIZATION TEST RESULTS');
  console.log('══════════════════════════════════════════════════════════════════════');
  console.log('📊 Overall Results:');
  console.log(`   Total Tests: ${testResults.totalTests}`);
  console.log(`   ✅ Passed: ${testResults.passedTests}`);
  console.log(`   ❌ Failed: ${testResults.failedTests}`);
  console.log(`   📈 Success Rate: ${((testResults.passedTests / testResults.totalTests) * 100).toFixed(1)}%`);

  console.log('\n⚡ Performance Metrics:');
  console.log(`   Average Response Time: ${Math.round(testResults.performance.averageResponseTime)}ms`);
  console.log(`   Max Response Time: ${testResults.performance.maxResponseTime}ms`);
  console.log(`   Min Response Time: ${testResults.performance.minResponseTime}ms`);

  const successRate = (testResults.passedTests / testResults.totalTests);
  let systemAssessment = '';
  
  if (successRate >= 0.9) {
    systemAssessment = '🏆 EXCELLENT - System performing optimally';
  } else if (successRate >= 0.8) {
    systemAssessment = '✅ GOOD - System functioning well with minor issues';
  } else if (successRate >= 0.6) {
    systemAssessment = '⚠️  FAIR - System operational but needs attention';
  } else {
    systemAssessment = '❌ POOR - System requires significant fixes';
  }

  console.log('\n🏆 System Assessment:');
  console.log(`   ${systemAssessment}`);

  if (testResults.failedTests > 0) {
    console.log('\n🔧 Recommended Actions:');
    console.log('   • Check API endpoint implementations');
    console.log('   • Verify micro-optimization engine initialization');
    console.log('   • Review real-time data processing pipeline');
    console.log('   • Test coaching system functionality');
  }

  console.log('\n✨ Micro-Optimization Test Suite completed!');
  console.log('══════════════════════════════════════════════════════════════════════');
}

// Run tests
runAllTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
}); 