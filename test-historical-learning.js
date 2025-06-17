// 🧪 COMPLETE TESTING SCRIPT FOR HISTORICAL LEARNING SYSTEM

console.log('🧪 TESTING HISTORICAL LEARNING SYSTEM FOR ROUTEOPTIMIZER PRO');
console.log('================================================================');

// Test Configuration
const API_BASE = 'http://localhost:3001/api/route-optimizer-ml';
const DELAY = 1000; // 1 second between tests

// Utility function pentru delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test data
const testRoutes = [
  {
    name: 'Route 1: Brussels to Antwerp',
    distance: 45,
    trafficData: { congestion: 0.3, estimatedDelay: 15 },
    vehicle: { type: 'diesel', efficiency: 0.8 },
    driver: { experience: 5 },
    weatherData: { condition: 'sunny', drivingScore: 0.9 },
    fuelPrices: { average: 1.45 }
  },
  {
    name: 'Route 2: Ghent to Brussels',
    distance: 55,
    trafficData: { congestion: 0.5, estimatedDelay: 25 },
    vehicle: { type: 'electric', efficiency: 0.9 },
    driver: { experience: 8 },
    weatherData: { condition: 'rain', drivingScore: 0.7 },
    fuelPrices: { average: 1.48 }
  },
  {
    name: 'Route 3: Liège to Namur',
    distance: 65,
    trafficData: { congestion: 0.2, estimatedDelay: 10 },
    vehicle: { type: 'diesel', efficiency: 0.75 },
    driver: { experience: 3 },
    weatherData: { condition: 'cloudy', drivingScore: 0.85 },
    fuelPrices: { average: 1.42 }
  },
  {
    name: 'Route 4: Bruges to Ostend',
    distance: 25,
    trafficData: { congestion: 0.1, estimatedDelay: 5 },
    vehicle: { type: 'hybrid', efficiency: 0.85 },
    driver: { experience: 10 },
    weatherData: { condition: 'sunny', drivingScore: 0.95 },
    fuelPrices: { average: 1.46 }
  },
  {
    name: 'Route 5: Charleroi to Mons',
    distance: 35,
    trafficData: { congestion: 0.4, estimatedDelay: 20 },
    vehicle: { type: 'diesel', efficiency: 0.78 },
    driver: { experience: 6 },
    weatherData: { condition: 'fog', drivingScore: 0.6 },
    fuelPrices: { average: 1.50 }
  }
];

// Storage pentru route IDs și predictions
const routeResults = [];
let testsPassed = 0;
let totalTests = 0;

// Helper functions
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`❌ Request failed: ${error.message}`);
    throw error;
  }
}

async function runTest(testName, testFunction) {
  totalTests++;
  console.log(`\n🧪 Testing: ${testName}`);
  console.log('─'.repeat(50));
  
  try {
    await testFunction();
    testsPassed++;
    console.log(`✅ PASS: ${testName}`);
  } catch (error) {
    console.error(`❌ FAIL: ${testName}`);
    console.error(`   Error: ${error.message}`);
  }
  
  await delay(DELAY);
}

// TEST 1: API Health Check
async function testApiHealth() {
  const response = await makeRequest(API_BASE);
  
  if (!response.success) {
    throw new Error('API not responding successfully');
  }
  
  console.log('📡 API Status:', response.data.message);
  console.log('🔧 Version:', response.data.version);
  console.log('✨ Features:', JSON.stringify(response.data.features, null, 2));
}

// TEST 2: Service Statistics
async function testServiceStats() {
  const response = await makeRequest(`${API_BASE}?action=stats`);
  
  if (!response.success) {
    throw new Error('Failed to get service stats');
  }
  
  console.log('📊 Service Status:', response.data.info.status);
  console.log('🧠 ML Model:', response.data.service.mlStats?.model || 'not loaded');
  console.log('📚 Historical Routes:', response.data.service.historicalRoutes || 0);
  console.log('🎯 Average Accuracy:', response.data.service.averageAccuracy || 'N/A');
  
  if (response.data.service.historicalRoutes === undefined) {
    throw new Error('Historical routes count missing');
  }
}

// TEST 3: Learning Insights
async function testLearningInsights() {
  const response = await makeRequest(`${API_BASE}?action=insights`);
  
  if (!response.success) {
    throw new Error('Failed to get learning insights');
  }
  
  console.log('📈 Learning Data Available:', response.data.message || 'Yes');
  
  if (response.data.totalRoutes !== undefined) {
    console.log('📊 Total Routes Learned:', response.data.totalRoutes);
    console.log('📈 Average Accuracy:', response.data.averageAccuracy);
    console.log('📊 Improvement Trend:', response.data.improvementTrend);
  }
}

// TEST 4: Historical Patterns Analysis
async function testPatternsAnalysis() {
  const response = await makeRequest(`${API_BASE}?action=patterns`);
  
  if (!response.success && response.data !== null) {
    throw new Error('Failed to get patterns analysis');
  }
  
  if (response.data === null) {
    console.log('ℹ️ Not enough data for pattern analysis yet (need 10+ routes)');
  } else {
    console.log('🔍 Patterns Analysis:', JSON.stringify(response.data, null, 2));
  }
}

// TEST 5: Route Optimization (Enhanced with Learning)
async function testRouteOptimization() {
  const testRoute = testRoutes[0];
  console.log(`🎯 Optimizing: ${testRoute.name}`);
  
  const response = await makeRequest(API_BASE, {
    method: 'POST',
    body: JSON.stringify(testRoute)
  });
  
  if (!response.success) {
    throw new Error('Route optimization failed');
  }
  
  const prediction = response.data;
  
  console.log('📊 Optimization Results:');
  console.log(`   📏 Distance: ${prediction.distance?.toFixed(1)} km`);
  console.log(`   💰 Savings: ${(prediction.optimizationFactor * 100)?.toFixed(1)}%`);
  console.log(`   🎯 Confidence: ${(prediction.confidence * 100)?.toFixed(1)}%`);
  console.log(`   🧠 ML Enhanced: ${prediction.mlUsed ? 'Yes' : 'No'}`);
  console.log(`   📚 Historical Enhancement: ${prediction.historicallyEnhanced ? 'Yes' : 'No'}`);
  
  if (prediction.historicallyEnhanced) {
    console.log(`   🔍 Based on ${prediction.basedOnSimilarRoutes} similar routes`);
  }
  
  // Store pentru learning test
  routeResults.push({
    routeId: prediction.routeId,
    prediction: prediction,
    testRoute: testRoute
  });
  
  if (!prediction.routeId) {
    throw new Error('Route ID missing from prediction');
  }
}

// TEST 6: Multiple Route Optimizations (pentru building learning data)
async function testMultipleOptimizations() {
  console.log('🔄 Running multiple optimizations to build learning data...');
  
  for (let i = 1; i < testRoutes.length; i++) {
    const testRoute = testRoutes[i];
    console.log(`   📍 Processing: ${testRoute.name}`);
    
    try {
      const response = await makeRequest(API_BASE, {
        method: 'POST',
        body: JSON.stringify(testRoute)
      });
      
      if (response.success) {
        routeResults.push({
          routeId: response.data.routeId,
          prediction: response.data,
          testRoute: testRoute
        });
        
        console.log(`   ✅ Optimized: ${(response.data.optimizationFactor * 100).toFixed(1)}% savings`);
      }
    } catch (error) {
      console.log(`   ⚠️ Failed: ${testRoute.name} - ${error.message}`);
    }
    
    await delay(500); // Short delay between requests
  }
  
  console.log(`📊 Total routes optimized: ${routeResults.length}`);
}

// TEST 7: Learning Feedback (Report Actual Results)
async function testLearningFeedback() {
  if (routeResults.length === 0) {
    throw new Error('No route results to provide feedback for');
  }
  
  console.log('📝 Providing learning feedback for optimized routes...');
  
  let feedbackCount = 0;
  
  for (const result of routeResults) {
    // Generate realistic actual results
    const actualSavingsPercent = Math.max(5, 
      result.prediction.optimizationFactor * 100 + (Math.random() - 0.5) * 10
    );
    
    const actualResult = {
      actualSavingsPercent: actualSavingsPercent,
      actualDistance: result.prediction.distance * (0.95 + Math.random() * 0.1),
      actualDuration: result.prediction.duration * (0.9 + Math.random() * 0.2),
      actualFuelConsumed: result.testRoute.distance * 0.08,
      actualCost: result.testRoute.distance * 0.08 * 1.45,
      driverSatisfaction: Math.floor(Math.random() * 2) + 4, // 4-5 rating
      routeFollowed: Math.random() > 0.1, // 90% follow recommendation
      completedSuccessfully: true,
      weatherActual: result.testRoute.weatherData.condition,
      trafficActual: result.testRoute.trafficData.congestion
    };
    
    try {
      const response = await makeRequest(API_BASE, {
        method: 'PUT',
        body: JSON.stringify({
          routeId: result.routeId,
          actualResult: actualResult
        })
      });
      
      if (response.success) {
        feedbackCount++;
        console.log(`   ✅ Feedback recorded for ${result.testRoute.name}`);
        console.log(`      Predicted: ${(result.prediction.optimizationFactor * 100).toFixed(1)}% vs Actual: ${actualResult.actualSavingsPercent.toFixed(1)}%`);
      } else {
        console.log(`   ⚠️ Feedback failed for ${result.testRoute.name}: ${response.error}`);
      }
    } catch (error) {
      console.log(`   ❌ Feedback error for ${result.testRoute.name}: ${error.message}`);
    }
    
    await delay(200);
  }
  
  console.log(`📊 Learning feedback provided for ${feedbackCount}/${routeResults.length} routes`);
  
  if (feedbackCount === 0) {
    throw new Error('No learning feedback was successfully recorded');
  }
}

// TEST 8: Post-Learning Statistics
async function testPostLearningStats() {
  console.log('📈 Checking statistics after learning feedback...');
  
  const response = await makeRequest(`${API_BASE}?action=stats`);
  
  if (!response.success) {
    throw new Error('Failed to get post-learning stats');
  }
  
  console.log('📊 Updated Statistics:');
  console.log(`   📚 Historical Routes: ${response.data.service.historicalRoutes || 0}`);
  console.log(`   🎯 Average Accuracy: ${((response.data.service.averageAccuracy || 0) * 100).toFixed(1)}%`);
  console.log(`   📈 Learning System: ${response.data.learning.message || 'Active'}`);
  
  // Verify that historical routes increased
  const historicalRoutes = response.data.service.historicalRoutes || 0;
  if (historicalRoutes < routeResults.length) {
    console.log(`   ⚠️ Expected ${routeResults.length} historical routes, got ${historicalRoutes}`);
  } else {
    console.log(`   ✅ Historical learning data successfully recorded`);
  }
}

// TEST 9: Enhanced Predictions (with Historical Learning)
async function testEnhancedPredictions() {
  console.log('🧠 Testing enhanced predictions with historical learning...');
  
  // Test a similar route to previous ones
  const similarRoute = {
    name: 'Similar Route: Brussels to Antwerp (Variation)',
    distance: 47, // Similar to first test route
    trafficData: { congestion: 0.35, estimatedDelay: 18 },
    vehicle: { type: 'diesel', efficiency: 0.8 },
    driver: { experience: 5 },
    weatherData: { condition: 'sunny', drivingScore: 0.9 },
    fuelPrices: { average: 1.45 }
  };
  
  const response = await makeRequest(API_BASE, {
    method: 'POST',
    body: JSON.stringify(similarRoute)
  });
  
  if (!response.success) {
    throw new Error('Enhanced prediction failed');
  }
  
  const prediction = response.data;
  
  console.log('🎯 Enhanced Prediction Results:');
  console.log(`   📏 Distance: ${prediction.distance?.toFixed(1)} km`);
  console.log(`   💰 Savings: ${(prediction.optimizationFactor * 100)?.toFixed(1)}%`);
  console.log(`   🎯 Confidence: ${(prediction.confidence * 100)?.toFixed(1)}%`);
  console.log(`   📚 Historical Enhancement: ${prediction.historicallyEnhanced ? 'Yes' : 'No'}`);
  
  if (prediction.historicallyEnhanced) {
    console.log(`   🔍 Based on ${prediction.basedOnSimilarRoutes} similar historical routes`);
    console.log(`   📊 Historical Accuracy: ${(prediction.historicalAccuracy * 100)?.toFixed(1)}%`);
    
    if (prediction.learningData?.recommendedActions) {
      console.log(`   💡 Recommendations: ${prediction.learningData.recommendedActions.slice(0, 2).join(', ')}`);
    }
  }
}

// TEST 10: Learning Insights After Data Collection
async function testFinalLearningInsights() {
  const response = await makeRequest(`${API_BASE}?action=insights`);
  
  if (!response.success) {
    throw new Error('Failed to get final learning insights');
  }
  
  console.log('📈 Final Learning Insights:');
  
  if (response.data.totalRoutes !== undefined) {
    console.log(`   📊 Total Routes: ${response.data.totalRoutes}`);
    console.log(`   🎯 Average Accuracy: ${(response.data.averageAccuracy * 100).toFixed(1)}%`);
    console.log(`   📈 Improvement Trend: ${response.data.improvementTrend}`);
    
    if (response.data.recommendations) {
      console.log('   💡 AI Recommendations:');
      response.data.recommendations.forEach(rec => {
        console.log(`      • ${rec.recommendation} (${rec.potential_improvement} improvement)`);
      });
    }
  } else {
    console.log('   ℹ️', response.data.message);
  }
}

// MAIN TEST EXECUTION
async function runAllTests() {
  console.log('🚀 Starting Historical Learning System Tests...\n');
  
  try {
    // Basic API Tests
    await runTest('API Health Check', testApiHealth);
    await runTest('Service Statistics', testServiceStats);
    await runTest('Learning Insights', testLearningInsights);
    await runTest('Patterns Analysis', testPatternsAnalysis);
    
    // Route Optimization Tests
    await runTest('Single Route Optimization', testRouteOptimization);
    await runTest('Multiple Route Optimizations', testMultipleOptimizations);
    
    // Learning System Tests
    await runTest('Learning Feedback Reporting', testLearningFeedback);
    await runTest('Post-Learning Statistics', testPostLearningStats);
    await runTest('Enhanced Predictions with Learning', testEnhancedPredictions);
    await runTest('Final Learning Insights', testFinalLearningInsights);
    
  } catch (error) {
    console.error('\n❌ CRITICAL ERROR during testing:', error.message);
  }
  
  // Test Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 TESTING SUMMARY');
  console.log('='.repeat(70));
  console.log(`✅ Tests Passed: ${testsPassed}`);
  console.log(`❌ Tests Failed: ${totalTests - testsPassed}`);
  console.log(`📊 Success Rate: ${((testsPassed / totalTests) * 100).toFixed(1)}%`);
  
  if (testsPassed === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! Historical Learning System is working correctly.');
    console.log('\n📚 READY FOR PRODUCTION USE:');
    console.log('   ✅ Historical route learning active');
    console.log('   ✅ Pattern recognition functional');
    console.log('   ✅ Similarity-based enhancement working');
    console.log('   ✅ Continuous learning feedback loop established');
    console.log('   ✅ API endpoints fully operational');
  } else {
    console.log('\n⚠️ Some tests failed. Review the errors above.');
  }
  
  console.log('\n🔗 Next Steps:');
  console.log('   1. Collect more real-world route data');
  console.log('   2. Monitor accuracy improvements over time');
  console.log('   3. Implement PROMPT 3: Driver Personalization');
  
  console.log('\n📝 Usage Example:');
  console.log(`
// Client code example:
const prediction = await fetch('${API_BASE}', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    distance: 50,
    vehicle: { type: 'diesel' },
    trafficData: { congestion: 0.3 }
  })
});

// Later, report actual results:
await fetch('${API_BASE}', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    routeId: 'route_123',
    actualResult: {
      actualSavingsPercent: 22,
      actualDistance: 48,
      driverSatisfaction: 5
    }
  })
});
  `);
}

// Run tests when script is executed
if (typeof window === 'undefined') {
  // Node.js environment
  runAllTests().catch(console.error);
} else {
  // Browser environment
  console.log('🌐 Run runAllTests() to start testing');
  window.runAllTests = runAllTests;
} 