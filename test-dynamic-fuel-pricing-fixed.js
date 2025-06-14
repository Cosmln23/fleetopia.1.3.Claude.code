// 💰 Dynamic Fuel Pricing Test Suite - PROMPT 2 Implementation
// Comprehensive testing pentru Dynamic Fuel Pricing Optimizer

const BASE_URL = 'http://localhost:3004'; // Update port as needed

console.log('💰 Starting Dynamic Fuel Pricing Optimizer Test Suite...\n');

// Test configuration
const TEST_CONFIG = {
  maxRetries: 3,
  timeoutMs: 10000,
  expectedResponseTime: 5000,
  minimumSavingsPercent: 0.03, // 3%
  acceptableAccuracy: 0.75, // 75%
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
    const result = await makeRequest('/api/dynamic-fuel-pricing?action=system_status');
    
    if (result.success && result.data) {
      const status = result.data;
      
      const isOperational = status.status === 'operational';
      logTest('System Status Check', isOperational, `Status: ${status.status}`);
      
      const components = status.components || {};
      const activeComponents = Object.keys(components).length;
      logTest('Component Health Check', activeComponents >= 5, `${activeComponents} components active`);
      
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

// === TEST 2: Fuel Purchase Optimization ===
async function testFuelPurchaseOptimization() {
  console.log('\n🔧 Testing Fuel Purchase Optimization:');
  console.log('─'.repeat(50));
  
  try {
    const vehicleProfile = {
      id: 'TRUCK_001',
      technicalSpecs: { fuelSystem: { tankCapacity: 400 } },
      associations: { fuelCards: ['Shell', 'BP'] },
      fleetId: 'FLEET_001'
    };

    const route = {
      startLocation: { lat: 44.4268, lng: 26.1025 },
      endLocation: { lat: 44.5268, lng: 26.2025 },
      distance: 150,
      estimatedDuration: 3
    };

    const requestBody = {
      action: 'optimize_fuel_purchasing',
      route: route,
      vehicleProfile: vehicleProfile,
      fuelNeed: 150
    };
    
    const result = await makeRequest('/api/dynamic-fuel-pricing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    if (result.success && result.data) {
      const optimization = result.data;
      
      const hasStrategy = optimization.strategy && optimization.strategy.selectedStrategy;
      logTest('Optimization Structure', hasStrategy, 
        hasStrategy ? optimization.strategy.selectedStrategy.type : 'Missing strategy');
      
      if (hasStrategy && optimization.savings) {
        const savingsPercent = optimization.savings.totalSavingsPercent || 0;
        const reasonableSavings = savingsPercent >= 0 && savingsPercent <= 0.5;
        logTest('Savings Calculation', reasonableSavings, 
          `${(savingsPercent * 100).toFixed(1)}% savings`);
        
        const meetsThreshold = savingsPercent >= TEST_CONFIG.minimumSavingsPercent;
        logTest('Minimum Savings Threshold', meetsThreshold, 
          `${(savingsPercent * 100).toFixed(1)}% (min: ${TEST_CONFIG.minimumSavingsPercent * 100}%)`);
      }
      
      if (hasStrategy) {
        const confidence = optimization.strategy.selectedStrategy.confidence || 0;
        const goodConfidence = confidence >= 0.6;
        logTest('Confidence Level', goodConfidence, `${(confidence * 100).toFixed(1)}%`);
      }
      
      return true;
    } else {
      logTest('Optimization Request', false, result.error || 'No data');
      return false;
    }
  } catch (error) {
    logTest('Fuel Purchase Optimization Test', false, error.message);
    return false;
  }
}

// === TEST 3: Market Trends Analysis ===
async function testMarketTrendsAnalysis() {
  console.log('\n🔧 Testing Market Trends Analysis:');
  console.log('─'.repeat(50));
  
  try {
    const requestBody = { action: 'analyze_market_trends' };
    
    const result = await makeRequest('/api/dynamic-fuel-pricing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    if (result.success && result.data) {
      const marketData = result.data;
      
      const hasMarketTrends = marketData.marketTrends && marketData.marketTrends.currentTrend;
      logTest('Market Trends Structure', hasMarketTrends, 
        hasMarketTrends ? `Trend: ${marketData.marketTrends.currentTrend}` : 'Missing trend data');
      
      if (hasMarketTrends) {
        const validTrends = ['rising', 'falling', 'stable'];
        const validTrend = validTrends.includes(marketData.marketTrends.currentTrend);
        logTest('Trend Direction Validity', validTrend, 
          `Direction: ${marketData.marketTrends.currentTrend}`);
        
        const confidence = marketData.marketTrends.confidence || 0;
        const goodConfidence = confidence >= 0.5;
        logTest('Market Analysis Confidence', goodConfidence, 
          `${(confidence * 100).toFixed(1)}%`);
      }
      
      const hasAnalysis = marketData.analysis && marketData.analysis.recommendation;
      logTest('Market Recommendations', hasAnalysis, 
        hasAnalysis ? 'Recommendations provided' : 'No recommendations');
      
      return true;
    } else {
      logTest('Market Trends Analysis', false, result.error || 'No data received');
      return false;
    }
  } catch (error) {
    logTest('Market Trends Analysis Test', false, error.message);
    return false;
  }
}

// === Main Test Runner ===
async function runAllTests() {
  console.log('💰 Dynamic Fuel Pricing Optimizer - Test Suite');
  console.log('═'.repeat(70));
  console.log(`🎯 Target URL: ${BASE_URL}`);
  console.log(`⏱️  Timeout: ${TEST_CONFIG.timeoutMs}ms`);
  console.log(`📊 Expected Response Time: <${TEST_CONFIG.expectedResponseTime}ms`);
  console.log('═'.repeat(70));
  
  try {
    await testSystemStatus();
    await testFuelPurchaseOptimization();
    await testMarketTrendsAnalysis();
    
  } catch (error) {
    console.error('\n❌ Critical test failure:', error.message);
  }
  
  // Generate final report
  generateFinalReport();
}

function generateFinalReport() {
  console.log('\n💰 DYNAMIC FUEL PRICING TEST RESULTS');
  console.log('═'.repeat(70));
  
  const successRate = testResults.totalTests > 0 ? 
    (testResults.passedTests / testResults.totalTests) * 100 : 0;
  
  console.log(`📊 Overall Results:`);
  console.log(`   Total Tests: ${testResults.totalTests}`);
  console.log(`   ✅ Passed: ${testResults.passedTests}`);
  console.log(`   ❌ Failed: ${testResults.failedTests}`);
  console.log(`   📈 Success Rate: ${successRate.toFixed(1)}%`);
  
  console.log(`\n⚡ Performance Metrics:`);
  console.log(`   Average Response Time: ${testResults.performance.averageResponseTime.toFixed(0)}ms`);
  console.log(`   Max Response Time: ${testResults.performance.maxResponseTime}ms`);
  console.log(`   Min Response Time: ${testResults.performance.minResponseTime === Infinity ? 'N/A' : testResults.performance.minResponseTime + 'ms'}`);
  
  console.log(`\n🏆 System Assessment:`);
  if (successRate >= 90) {
    console.log('   🥇 EXCELLENT - Dynamic Fuel Pricing system is production-ready!');
  } else if (successRate >= 75) {
    console.log('   🥈 GOOD - System is functional with minor issues');
  } else if (successRate >= 50) {
    console.log('   🥉 FAIR - System needs improvements');
  } else {
    console.log('   ⚠️  POOR - System requires significant fixes');
  }
  
  console.log('\n✨ Dynamic Fuel Pricing Test Suite completed!');
  console.log('═'.repeat(70));
}

// Run the test suite
runAllTests().catch(error => {
  console.error('💥 Test suite failed to complete:', error);
  process.exit(1);
});
