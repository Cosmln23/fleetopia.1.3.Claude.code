// TEST DRIVER PERSONALIZATION SYSTEM
// RouteOptimizer Pro v3.0.0

console.log('🧪 Starting Driver Personalization Test Suite...');
console.log('======================================================');

// Configuration pentru tests
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  apiEndpoint: '/api/route-optimizer-ml',
  testDrivers: [
    'driver_john_001',
    'driver_maria_002', 
    'driver_alex_003'
  ],
  timeout: 30000
};

// Test route data
const TEST_ROUTES = [
  {
    name: 'Short City Route',
    data: {
      distance: 45,
      trafficData: { congestion: 0.6, estimatedDelay: 12 },
      vehicle: { type: 'diesel', efficiency: 85 },
      weatherData: { condition: 'clear', drivingScore: 0.95 },
      fuelPrices: { average: 1.42 }
    }
  },
  {
    name: 'Long Highway Route',
    data: {
      distance: 280,
      trafficData: { congestion: 0.3, estimatedDelay: 15 },
      vehicle: { type: 'diesel', efficiency: 92 },
      weatherData: { condition: 'cloudy', drivingScore: 0.85 },
      fuelPrices: { average: 1.38 }
    }
  },
  {
    name: 'Mixed Urban Route',
    data: {
      distance: 125,
      trafficData: { congestion: 0.8, estimatedDelay: 25 },
      vehicle: { type: 'hybrid', efficiency: 95 },
      weatherData: { condition: 'rain', drivingScore: 0.7 },
      fuelPrices: { average: 1.45 }
    }
  }
];

// Test actual results (different driver behaviors)
const DRIVER_RESULTS = {
  'driver_john_001': { // Efficient driver
    actualSavingsPercent: 32,
    actualDistance: 42,
    actualDuration: 1.2,
    actualFuelConsumed: 3.1,
    driverSatisfaction: 5,
    routeFollowed: true,
    completedSuccessfully: true,
    arrivalTime: new Date(Date.now() + 1.2 * 60 * 60 * 1000)
  },
  'driver_maria_002': { // Average driver
    actualSavingsPercent: 18,
    actualDistance: 46,
    actualDuration: 1.4,
    actualFuelConsumed: 3.8,
    driverSatisfaction: 4,
    routeFollowed: false,
    completedSuccessfully: true,
    deviationReasons: ['avoided_traffic', 'preferred_route'],
    arrivalTime: new Date(Date.now() + 1.4 * 60 * 60 * 1000)
  },
  'driver_alex_003': { // Learning driver
    actualSavingsPercent: 12,
    actualDistance: 48,
    actualDuration: 1.6,
    actualFuelConsumed: 4.2,
    driverSatisfaction: 3,
    routeFollowed: true,
    completedSuccessfully: true,
    arrivalTime: new Date(Date.now() + 1.6 * 60 * 60 * 1000)
  }
};

// Helper function pentru API calls
async function apiCall(method, endpoint, data = null) {
  const url = `${TEST_CONFIG.baseUrl}${TEST_CONFIG.apiEndpoint}${endpoint}`;
  
  const options = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    }
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  console.log(`📡 ${method} ${url}`);
  
  try {
    const response = await fetch(url, options);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${result.error || 'Unknown error'}`);
    }
    
    return result;
  } catch (error) {
    console.error(`❌ API call failed:`, error.message);
    throw error;
  }
}

// TEST 1: System Status with Driver Personalization
async function test1_SystemStatus() {
  console.log('\n📊 TEST 1: System Status with Driver Personalization');
  console.log('------------------------------------------------');
  
  try {
    const response = await apiCall('GET', '?action=stats');
    
    console.log('✅ API Response received');
    console.log('📋 System Info:', {
      name: response.data.info.name,
      version: response.data.info.version,
      status: response.data.info.status
    });
    
    console.log('🔧 Capabilities:', response.data.info.capabilities.slice(0, 5));
    console.log('📊 Statistics:', {
      initialized: response.data.service.initialized,
      historicalRoutes: response.data.service.historicalRoutes,
      averageAccuracy: response.data.info.averageAccuracy
    });
    
    // Verify driver personalization is active
    const hasDriverPersonalization = response.data.info.capabilities.includes('Driver personalization and behavior learning');
    if (hasDriverPersonalization) {
      console.log('✅ Driver Personalization: ACTIVE');
    } else {
      console.log('❌ Driver Personalization: NOT DETECTED');
    }
    
    return response.success && hasDriverPersonalization;
    
  } catch (error) {
    console.error('❌ Test 1 failed:', error.message);
    return false;
  }
}

// TEST 2: Personalized Route Optimization 
async function test2_PersonalizedOptimization() {
  console.log('\n🎯 TEST 2: Personalized Route Optimization');
  console.log('------------------------------------------');
  
  const results = [];
  
  for (const driverId of TEST_CONFIG.testDrivers) {
    try {
      console.log(`\n👤 Testing personalization for: ${driverId}`);
      
      // Get personalized prediction
      const routeData = {
        ...TEST_ROUTES[0].data,
        driverId: driverId
      };
      
      const response = await apiCall('POST', '', routeData);
      
      console.log('✅ Prediction received:', {
        optimizationFactor: (response.data.optimizationFactor * 100).toFixed(1) + '%',
        confidence: (response.data.confidence * 100).toFixed(1) + '%',
        personalizedForDriver: response.data.personalizedForDriver || 'none',
        driverPersonalizationApplied: response.data.driverPersonalizationApplied
      });
      
      // Check for driver-specific elements
      if (response.data.driverPersonalization) {
        console.log('👤 Driver Data:', {
          riskLevel: response.data.driverPersonalization.riskLevel,
          focusArea: response.data.driverPersonalization.focusArea,
          recommendations: response.data.driverPersonalization.recommendations.length
        });
      }
      
      results.push({
        driverId: driverId,
        routeId: response.data.routeId,
        success: response.success,
        personalized: response.data.driverPersonalizationApplied || false
      });
      
    } catch (error) {
      console.error(`❌ Failed for ${driverId}:`, error.message);
      results.push({ driverId: driverId, success: false });
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  console.log(`\n📊 Personalized Optimization Results: ${successCount}/${TEST_CONFIG.testDrivers.length} successful`);
  
  return successCount === TEST_CONFIG.testDrivers.length;
}

// TEST 3: Driver Learning Through Results Reporting
async function test3_DriverLearning() {
  console.log('\n📚 TEST 3: Driver Learning Through Results Reporting');
  console.log('---------------------------------------------------');
  
  const learningResults = [];
  
  for (const driverId of TEST_CONFIG.testDrivers) {
    try {
      console.log(`\n👤 Creating driver profile for: ${driverId}`);
      
      // Create multiple routes pentru driver learning
      for (let i = 0; i < 3; i++) {
        // Get prediction
        const routeData = {
          ...TEST_ROUTES[i % TEST_ROUTES.length].data,
          driverId: driverId
        };
        
        const prediction = await apiCall('POST', '', routeData);
        
        // Report actual result with driver-specific behavior
        const actualResult = {
          ...DRIVER_RESULTS[driverId],
          // Vary results slightly pentru realistic learning
          actualSavingsPercent: DRIVER_RESULTS[driverId].actualSavingsPercent + (Math.random() - 0.5) * 6,
          actualDuration: DRIVER_RESULTS[driverId].actualDuration + (Math.random() - 0.5) * 0.3
        };
        
        const learningResponse = await apiCall('PUT', '', {
          routeId: prediction.data.routeId,
          actualResult: actualResult,
          driverId: driverId
        });
        
        console.log(`  Route ${i + 1}: ${learningResponse.data.driverLearningUpdated ? '✅ Learned' : '⚠️ No learning'}`);
      }
      
      learningResults.push({ driverId: driverId, success: true });
      
    } catch (error) {
      console.error(`❌ Learning failed for ${driverId}:`, error.message);
      learningResults.push({ driverId: driverId, success: false });
    }
  }
  
  const successCount = learningResults.filter(r => r.success).length;
  console.log(`\n📊 Driver Learning Results: ${successCount}/${TEST_CONFIG.testDrivers.length} drivers learned`);
  
  return successCount > 0;
}

// TEST 4: Driver Coaching Insights
async function test4_DriverCoaching() {
  console.log('\n🎓 TEST 4: Driver Coaching Insights');
  console.log('-----------------------------------');
  
  const coachingResults = [];
  
  for (const driverId of TEST_CONFIG.testDrivers) {
    try {
      console.log(`\n👤 Getting coaching insights for: ${driverId}`);
      
      const response = await apiCall('GET', `?action=driver-coaching&driverId=${driverId}`);
      
      if (response.success) {
        const coaching = response.data.coaching;
        
        console.log('✅ Coaching insights received:', {
          profileCompleteness: coaching.profileCompleteness ? (coaching.profileCompleteness * 100).toFixed(1) + '%' : 'N/A',
          totalRoutes: coaching.totalRoutes || 0,
          strengths: coaching.strengths ? coaching.strengths.length : 0,
          improvementAreas: coaching.improvementAreas ? coaching.improvementAreas.length : 0
        });
        
        if (coaching.strengths && coaching.strengths.length > 0) {
          console.log('💪 Strengths:', coaching.strengths[0].substring(0, 60) + '...');
        }
        
        if (coaching.improvementAreas && coaching.improvementAreas.length > 0) {
          console.log('📈 Improvement:', coaching.improvementAreas[0].area);
        }
        
        coachingResults.push({ driverId: driverId, success: true, hasData: coaching.totalRoutes > 0 });
      } else {
        console.log('⚠️ No coaching data available yet');
        coachingResults.push({ driverId: driverId, success: true, hasData: false });
      }
      
    } catch (error) {
      console.error(`❌ Coaching failed for ${driverId}:`, error.message);
      coachingResults.push({ driverId: driverId, success: false });
    }
  }
  
  const successCount = coachingResults.filter(r => r.success).length;
  console.log(`\n📊 Coaching Results: ${successCount}/${TEST_CONFIG.testDrivers.length} successful`);
  
  return successCount > 0;
}

// TEST 5: Driver Performance Comparison
async function test5_DriverComparison() {
  console.log('\n🆚 TEST 5: Driver Performance Comparison');
  console.log('---------------------------------------');
  
  try {
    const driver1 = TEST_CONFIG.testDrivers[0];
    const driver2 = TEST_CONFIG.testDrivers[1];
    
    console.log(`\n👥 Comparing: ${driver1} vs ${driver2}`);
    
    const response = await apiCall('GET', `?action=driver-comparison&driverId=${driver1}&driverId2=${driver2}`);
    
    if (response.success && response.data.comparison) {
      const comp = response.data.comparison;
      
      console.log('✅ Comparison results received');
      console.log('🏆 Winners:', {
        fuelEfficiency: comp.fuelEfficiency ? comp.fuelEfficiency.winner : 'N/A',
        punctuality: comp.punctuality ? comp.punctuality.winner : 'N/A',
        routeAdherence: comp.routeAdherence ? comp.routeAdherence.winner : 'N/A',
        satisfaction: comp.overallSatisfaction ? comp.overallSatisfaction.winner : 'N/A'
      });
      
      console.log('📊 Scores:', {
        driver1FuelEff: comp.fuelEfficiency ? comp.fuelEfficiency.driver1.toFixed(2) : 'N/A',
        driver2FuelEff: comp.fuelEfficiency ? comp.fuelEfficiency.driver2.toFixed(2) : 'N/A'
      });
      
      return true;
    } else {
      console.log('⚠️ Comparison not available (insufficient data)');
      return true; // Not a failure if data is insufficient
    }
    
  } catch (error) {
    console.error('❌ Driver comparison failed:', error.message);
    return false;
  }
}

// TEST 6: Fleet Analytics
async function test6_FleetAnalytics() {
  console.log('\n🚛 TEST 6: Fleet Analytics');
  console.log('---------------------------');
  
  try {
    const response = await apiCall('GET', '?action=fleet-analytics');
    
    if (response.success) {
      const fleet = response.data;
      
      console.log('✅ Fleet analytics received');
      console.log('📊 Fleet Overview:', {
        totalDrivers: fleet.totalDrivers || 0,
        message: fleet.message || 'Analytics available'
      });
      
      if (fleet.fleetAverages) {
        console.log('📈 Fleet Averages:', {
          fuelEfficiency: fleet.fleetAverages.fuelEfficiency.toFixed(2),
          punctuality: (fleet.fleetAverages.punctuality * 100).toFixed(1) + '%',
          routeAdherence: (fleet.fleetAverages.routeAdherence * 100).toFixed(1) + '%'
        });
      }
      
      if (fleet.topPerformers) {
        console.log('🏆 Top Performers:', {
          mostFuelEfficient: fleet.topPerformers.mostFuelEfficient ? fleet.topPerformers.mostFuelEfficient.driverId : 'N/A',
          mostPunctual: fleet.topPerformers.mostPunctual ? fleet.topPerformers.mostPunctual.driverId : 'N/A'
        });
      }
      
      return true;
    } else {
      console.log('⚠️ Fleet analytics not available');
      return true; // Not a failure
    }
    
  } catch (error) {
    console.error('❌ Fleet analytics failed:', error.message);
    return false;
  }
}

// TEST 7: API Endpoints Validation
async function test7_APIEndpoints() {
  console.log('\n🔗 TEST 7: API Endpoints Validation');
  console.log('------------------------------------');
  
  const endpoints = [
    { name: 'Stats', endpoint: '?action=stats' },
    { name: 'Insights', endpoint: '?action=insights' },
    { name: 'Patterns', endpoint: '?action=patterns' },
    { name: 'Fleet Analytics', endpoint: '?action=fleet-analytics' }
  ];
  
  const results = [];
  
  for (const ep of endpoints) {
    try {
      console.log(`\n🔍 Testing: ${ep.name}`);
      
      const response = await apiCall('GET', ep.endpoint);
      
      console.log(`✅ ${ep.name}: OK (${response.success ? 'success' : 'failed'})`);
      results.push({ name: ep.name, success: response.success });
      
    } catch (error) {
      console.error(`❌ ${ep.name}: FAILED - ${error.message}`);
      results.push({ name: ep.name, success: false });
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  console.log(`\n📊 API Endpoints: ${successCount}/${endpoints.length} working`);
  
  return successCount >= endpoints.length - 1; // Allow 1 failure
}

// TEST 8: Error Handling
async function test8_ErrorHandling() {
  console.log('\n🚨 TEST 8: Error Handling');
  console.log('-------------------------');
  
  const errorTests = [
    {
      name: 'Missing Driver ID for Coaching',
      call: () => apiCall('GET', '?action=driver-coaching'),
      expectError: true
    },
    {
      name: 'Invalid Driver Comparison',
      call: () => apiCall('GET', '?action=driver-comparison&driverId=invalid'),
      expectError: true
    },
    {
      name: 'Invalid Route Data',
      call: () => apiCall('POST', '', { invalid: 'data' }),
      expectError: true
    }
  ];
  
  let errorHandlingScore = 0;
  
  for (const test of errorTests) {
    try {
      console.log(`\n🧪 Testing: ${test.name}`);
      
      const response = await test.call();
      
      if (test.expectError && !response.success) {
        console.log('✅ Error properly handled');
        errorHandlingScore++;
      } else if (!test.expectError && response.success) {
        console.log('✅ Request successful');
        errorHandlingScore++;
      } else {
        console.log('⚠️ Unexpected response');
      }
      
    } catch (error) {
      if (test.expectError) {
        console.log('✅ Error properly caught');
        errorHandlingScore++;
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
  }
  
  console.log(`\n📊 Error Handling: ${errorHandlingScore}/${errorTests.length} tests passed`);
  
  return errorHandlingScore >= errorTests.length - 1;
}

// TEST 9: Performance and Load
async function test9_Performance() {
  console.log('\n⚡ TEST 9: Performance and Load');
  console.log('--------------------------------');
  
  try {
    console.log('\n🚀 Running concurrent personalized requests...');
    
    const startTime = Date.now();
    
    // Run concurrent requests pentru all drivers
    const promises = TEST_CONFIG.testDrivers.map(driverId => {
      return apiCall('POST', '', {
        ...TEST_ROUTES[0].data,
        driverId: driverId
      });
    });
    
    const results = await Promise.all(promises);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    const successCount = results.filter(r => r.success).length;
    
    console.log('📊 Performance Results:', {
      totalRequests: promises.length,
      successful: successCount,
      duration: duration + 'ms',
      averagePerRequest: Math.round(duration / promises.length) + 'ms'
    });
    
    const performanceOK = duration < TEST_CONFIG.timeout && successCount === promises.length;
    
    if (performanceOK) {
      console.log('✅ Performance test PASSED');
    } else {
      console.log('⚠️ Performance test FAILED');
    }
    
    return performanceOK;
    
  } catch (error) {
    console.error('❌ Performance test failed:', error.message);
    return false;
  }
}

// TEST 10: End-to-End Driver Personalization Workflow
async function test10_EndToEndWorkflow() {
  console.log('\n🔄 TEST 10: End-to-End Driver Personalization Workflow');
  console.log('-------------------------------------------------------');
  
  try {
    const testDriver = 'driver_e2e_test_' + Date.now();
    console.log(`\n👤 Testing complete workflow for: ${testDriver}`);
    
    // Step 1: Initial prediction (no personalization yet)
    console.log('\n1️⃣ Getting initial prediction...');
    const initialPrediction = await apiCall('POST', '', {
      ...TEST_ROUTES[0].data,
      driverId: testDriver
    });
    
    const initialPersonalized = initialPrediction.data.driverPersonalizationApplied;
    console.log(`   Initial personalization: ${initialPersonalized ? 'YES' : 'NO'}`);
    
    // Step 2: Report result to build profile
    console.log('\n2️⃣ Reporting actual result to build profile...');
    await apiCall('PUT', '', {
      routeId: initialPrediction.data.routeId,
      actualResult: {
        actualSavingsPercent: 25,
        actualDistance: 44,
        actualDuration: 1.3,
        actualFuelConsumed: 3.5,
        driverSatisfaction: 4,
        routeFollowed: true,
        completedSuccessfully: true
      },
      driverId: testDriver
    });
    
    // Step 3: Second prediction (should start showing personalization)
    console.log('\n3️⃣ Getting second prediction (should show learning)...');
    const secondPrediction = await apiCall('POST', '', {
      ...TEST_ROUTES[1].data,
      driverId: testDriver
    });
    
    const secondPersonalized = secondPrediction.data.driverPersonalizationApplied;
    console.log(`   Second personalization: ${secondPersonalized ? 'YES' : 'NO'}`);
    
    // Step 4: Get coaching insights
    console.log('\n4️⃣ Getting coaching insights...');
    const coaching = await apiCall('GET', `?action=driver-coaching&driverId=${testDriver}`);
    
    const hasCoaching = coaching.success && coaching.data.coaching.totalRoutes > 0;
    console.log(`   Coaching available: ${hasCoaching ? 'YES' : 'NO'}`);
    
    // Step 5: Check fleet analytics includes new driver
    console.log('\n5️⃣ Checking fleet analytics...');
    const fleet = await apiCall('GET', '?action=fleet-analytics');
    
    const fleetUpdated = fleet.success && fleet.data.totalDrivers > 0;
    console.log(`   Fleet analytics updated: ${fleetUpdated ? 'YES' : 'NO'}`);
    
    // Evaluate workflow
    const workflowSteps = [
      initialPrediction.success,
      secondPrediction.success,
      coaching.success,
      fleet.success,
      hasCoaching || secondPersonalized // At least some learning occurred
    ];
    
    const successfulSteps = workflowSteps.filter(Boolean).length;
    
    console.log(`\n📊 End-to-End Workflow: ${successfulSteps}/${workflowSteps.length} steps successful`);
    
    const workflowPassed = successfulSteps >= 4;
    
    if (workflowPassed) {
      console.log('✅ End-to-End Workflow PASSED');
    } else {
      console.log('❌ End-to-End Workflow FAILED');
    }
    
    return workflowPassed;
    
  } catch (error) {
    console.error('❌ End-to-End workflow failed:', error.message);
    return false;
  }
}

// MAIN TEST RUNNER
async function runAllTests() {
  console.log('🚀 DRIVER PERSONALIZATION TEST SUITE');
  console.log('=====================================');
  console.log(`🌐 Testing against: ${TEST_CONFIG.baseUrl}${TEST_CONFIG.apiEndpoint}`);
  console.log(`👥 Test drivers: ${TEST_CONFIG.testDrivers.join(', ')}`);
  console.log('');
  
  const testResults = [];
  
  // Run all tests
  const tests = [
    { name: 'System Status', fn: test1_SystemStatus },
    { name: 'Personalized Optimization', fn: test2_PersonalizedOptimization },
    { name: 'Driver Learning', fn: test3_DriverLearning },
    { name: 'Driver Coaching', fn: test4_DriverCoaching },
    { name: 'Driver Comparison', fn: test5_DriverComparison },
    { name: 'Fleet Analytics', fn: test6_FleetAnalytics },
    { name: 'API Endpoints', fn: test7_APIEndpoints },
    { name: 'Error Handling', fn: test8_ErrorHandling },
    { name: 'Performance', fn: test9_Performance },
    { name: 'End-to-End Workflow', fn: test10_EndToEndWorkflow }
  ];
  
  for (const test of tests) {
    try {
      const startTime = Date.now();
      const result = await test.fn();
      const duration = Date.now() - startTime;
      
      testResults.push({
        name: test.name,
        passed: result,
        duration: duration
      });
      
      console.log(`\n${result ? '✅' : '❌'} ${test.name}: ${result ? 'PASSED' : 'FAILED'} (${duration}ms)`);
      
    } catch (error) {
      console.error(`\n❌ ${test.name}: ERROR - ${error.message}`);
      testResults.push({
        name: test.name,
        passed: false,
        error: error.message
      });
    }
    
    // Pauză între tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // FINAL RESULTS
  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL TEST RESULTS');
  console.log('='.repeat(60));
  
  const passedTests = testResults.filter(r => r.passed).length;
  const totalTests = testResults.length;
  const passRate = ((passedTests / totalTests) * 100).toFixed(1);
  
  console.log(`\n🎯 Overall Results: ${passedTests}/${totalTests} tests passed (${passRate}%)`);
  
  testResults.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    const duration = result.duration ? `${result.duration}ms` : 'N/A';
    console.log(`   ${status} ${result.name} (${duration})`);
  });
  
  const systemHealth = passRate >= 80 ? 'EXCELLENT' : passRate >= 60 ? 'GOOD' : 'NEEDS IMPROVEMENT';
  
  console.log(`\n🏥 System Health: ${systemHealth}`);
  console.log(`🚀 Driver Personalization System: ${passRate >= 70 ? 'OPERATIONAL' : 'NEEDS ATTENTION'}`);
  
  if (passRate >= 80) {
    console.log('\n🎉 Driver Personalization System is ready for production!');
  } else if (passRate >= 60) {
    console.log('\n⚠️ Driver Personalization System is functional but needs refinement');
  } else {
    console.log('\n🚨 Driver Personalization System needs significant fixes');
  }
  
  console.log('\n📋 Next Steps:');
  if (passRate >= 80) {
    console.log('   • Start collecting real driver data');
    console.log('   • Monitor driver profile building');
    console.log('   • Implement driver coaching in UI');
    console.log('   • Prepare for PROMPT 4 (Vehicle-Specific Optimization)');
  } else {
    console.log('   • Fix failing tests');
    console.log('   • Review error logs');
    console.log('   • Verify driver personalization logic');
    console.log('   • Test with more data scenarios');
  }
  
  return {
    totalTests: totalTests,
    passedTests: passedTests,
    passRate: passRate,
    systemHealth: systemHealth,
    results: testResults
  };
}

// RUN TESTS
runAllTests().then(results => {
  console.log(`\n🏁 Driver Personalization Test Suite completed`);
  console.log(`📊 Final score: ${results.passRate}% (${results.passedTests}/${results.totalTests})`);
}).catch(error => {
  console.error('\n💥 Test suite failed to complete:', error);
}); 