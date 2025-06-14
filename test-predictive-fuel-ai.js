#!/usr/bin/env node

/**
 * 🧠 PREDICTIVE FUEL AI - COMPREHENSIVE TEST SUITE
 * 
 * Tests the complete PredictiveFuelAI system including:
 * - Neural network training with historical data
 * - 7-day fuel consumption predictions
 * - Weather integration and impact analysis
 * - Strategic recommendations generation
 * - Performance metrics and accuracy tracking
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3003/api/predictive-fuel-ai';

// Test configuration
const config = {
  vehicleId: 'TRUCK-PREDICTIVE-001',
  testRuns: 5,
  expectedAccuracy: 85, // Minimum expected accuracy %
  maxResponseTime: 5000, // Maximum response time in ms
};

// Performance tracking
const performance = {
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  averageResponseTime: 0,
  errors: []
};

/**
 * 🎯 MAIN TEST EXECUTION
 */
async function runPredictiveFuelAITests() {
  console.log('\n🧠 ===== PREDICTIVE FUEL AI - COMPREHENSIVE TEST SUITE =====\n');
  
  try {
    // Test 1: Generate demo data
    console.log('📊 Test 1: Generating demo training data...');
    const demoData = await getDemoData();
    logTestResult('Demo Data Generation', true, 'Generated successfully');
    
    // Test 2: Train the neural network
    console.log('\n🔄 Test 2: Training neural network model...');
    const trainingResult = await trainModel(demoData.historicalData);
    logTestResult('Model Training', trainingResult.success, trainingResult.message);
    
    // Test 3: Generate predictions
    console.log('\n🔮 Test 3: Generating 7-day fuel predictions...');
    const predictionResult = await generatePredictions(config.vehicleId, demoData.currentData, demoData.weatherForecast);
    logTestResult('Prediction Generation', predictionResult.success, predictionResult.message);
    
    if (predictionResult.success) {
      // Test 4: Analyze prediction quality
      console.log('\n📈 Test 4: Analyzing prediction quality...');
      const analysisResult = await analyzePredictionQuality(predictionResult.data);
      logTestResult('Prediction Quality Analysis', analysisResult.success, analysisResult.message);
      
      // Test 5: Test strategic recommendations
      console.log('\n💡 Test 5: Validating strategic recommendations...');
      const recommendationsResult = await validateRecommendations(predictionResult.data.recommendations);
      logTestResult('Strategic Recommendations', recommendationsResult.success, recommendationsResult.message);
      
      // Test 6: Performance stress test
      console.log('\n⚡ Test 6: Performance stress testing...');
      const stressTestResult = await performanceStressTest(config.vehicleId, demoData.currentData);
      logTestResult('Performance Stress Test', stressTestResult.success, stressTestResult.message);
      
      // Test 7: Accuracy simulation
      console.log('\n🎯 Test 7: Accuracy tracking simulation...');
      const accuracyResult = await testAccuracyTracking(predictionResult.data.predictions);
      logTestResult('Accuracy Tracking', accuracyResult.success, accuracyResult.message);
      
      // Test 8: Cache functionality
      console.log('\n💾 Test 8: Testing cache functionality...');
      const cacheResult = await testCacheFunctionality(config.vehicleId);
      logTestResult('Cache Functionality', cacheResult.success, cacheResult.message);
    }
    
    // Test 9: Get model metrics
    console.log('\n📊 Test 9: Retrieving model metrics...');
    const metricsResult = await getModelMetrics();
    logTestResult('Model Metrics Retrieval', metricsResult.success, metricsResult.message);
    
    // Final summary
    printTestSummary();
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
}

/**
 * 📊 Get demo data for testing
 */
async function getDemoData() {
  const startTime = Date.now();
  
  try {
    const response = await axios.get(`${BASE_URL}?action=demo_data`);
    
    if (response.data.success) {
      const responseTime = Date.now() - startTime;
      performance.averageResponseTime += responseTime;
      
      console.log(`✅ Demo data generated: ${response.data.data.historicalData.length} historical records`);
      console.log(`   Current data: Vehicle ${response.data.data.currentData.vehicleId}`);
      console.log(`   Weather forecast: ${response.data.data.weatherForecast.length} days`);
      console.log(`   Response time: ${responseTime}ms`);
      
      return response.data.data;
    } else {
      throw new Error('Failed to generate demo data');
    }
  } catch (error) {
    throw new Error(`Demo data generation failed: ${error.message}`);
  }
}

/**
 * 🔄 Train the neural network model
 */
async function trainModel(historicalData) {
  const startTime = Date.now();
  
  try {
    const response = await axios.post(BASE_URL, {
      action: 'train',
      historicalData: historicalData
    });
    
    const responseTime = Date.now() - startTime;
    performance.averageResponseTime += responseTime;
    
    if (response.data.success) {
      console.log(`✅ Model trained successfully!`);
      console.log(`   Accuracy: ${response.data.accuracy.toFixed(2)}%`);
      console.log(`   Training data points: ${response.data.dataPoints}`);
      console.log(`   Training time: ${responseTime}ms`);
      
      return {
        success: true,
        message: `Training completed with ${response.data.accuracy.toFixed(2)}% accuracy`,
        accuracy: response.data.accuracy
      };
    } else {
      throw new Error('Training failed');
    }
  } catch (error) {
    return {
      success: false,
      message: `Training failed: ${error.response?.data?.message || error.message}`
    };
  }
}

/**
 * 🔮 Generate 7-day fuel predictions
 */
async function generatePredictions(vehicleId, currentData, weatherForecast) {
  const startTime = Date.now();
  
  try {
    const response = await axios.post(BASE_URL, {
      action: 'predict',
      vehicleId: vehicleId,
      currentData: currentData,
      weatherForecast: weatherForecast
    });
    
    const responseTime = Date.now() - startTime;
    performance.averageResponseTime += responseTime;
    
    if (response.data.success) {
      const predictions = response.data.data;
      
      console.log(`✅ 7-day predictions generated successfully!`);
      console.log(`   Vehicle: ${predictions.vehicleId}`);
      console.log(`   Total predicted consumption: ${predictions.totalPredictedConsumption.toFixed(2)}L`);
      console.log(`   Average efficiency: ${predictions.averageEfficiency.toFixed(2)}%`);
      console.log(`   Model accuracy: ${predictions.accuracyScore.toFixed(2)}%`);
      console.log(`   Strategic recommendations: ${predictions.recommendations.length}`);
      console.log(`   Response time: ${responseTime}ms`);
      
      // Display daily predictions
      console.log('\n   📅 Daily Predictions:');
      predictions.predictions.forEach((pred, index) => {
        console.log(`     Day ${pred.day}: ${pred.predictedConsumption.toFixed(1)}L (${(pred.confidence * 100).toFixed(1)}% confidence)`);
      });
      
      return {
        success: true,
        message: `Generated ${predictions.predictions.length} daily predictions`,
        data: predictions
      };
    } else {
      throw new Error('Prediction failed');
    }
  } catch (error) {
    return {
      success: false,
      message: `Prediction failed: ${error.response?.data?.message || error.message}`
    };
  }
}

/**
 * 📈 Analyze prediction quality
 */
async function analyzePredictionQuality(predictions) {
  try {
    // Validate prediction structure
    if (!predictions.predictions || predictions.predictions.length !== 7) {
      throw new Error('Invalid prediction structure');
    }
    
    // Check confidence levels
    const avgConfidence = predictions.predictions.reduce((sum, p) => sum + p.confidence, 0) / 7;
    if (avgConfidence < 0.5) {
      throw new Error(`Low confidence: ${(avgConfidence * 100).toFixed(1)}%`);
    }
    
    // Validate consumption values
    const consumptionValues = predictions.predictions.map(p => p.predictedConsumption);
    const avgConsumption = consumptionValues.reduce((sum, val) => sum + val, 0) / 7;
    
    if (avgConsumption < 10 || avgConsumption > 200) {
      throw new Error(`Unrealistic consumption values: ${avgConsumption.toFixed(1)}L/day average`);
    }
    
    // Check for reasonable variation
    const maxConsumption = Math.max(...consumptionValues);
    const minConsumption = Math.min(...consumptionValues);
    const variation = ((maxConsumption - minConsumption) / avgConsumption) * 100;
    
    console.log(`✅ Prediction quality analysis:`);
    console.log(`   Average confidence: ${(avgConfidence * 100).toFixed(1)}%`);
    console.log(`   Average consumption: ${avgConsumption.toFixed(1)}L/day`);
    console.log(`   Consumption variation: ${variation.toFixed(1)}%`);
    console.log(`   Weather impact factors included: ${predictions.predictions.every(p => p.weatherImpact >= 0)}`);
    console.log(`   Traffic impact factors included: ${predictions.predictions.every(p => p.trafficImpact >= 0)}`);
    
    return {
      success: true,
      message: `Quality analysis passed with ${(avgConfidence * 100).toFixed(1)}% avg confidence`
    };
  } catch (error) {
    return {
      success: false,
      message: `Quality analysis failed: ${error.message}`
    };
  }
}

/**
 * 💡 Validate strategic recommendations
 */
async function validateRecommendations(recommendations) {
  try {
    if (!recommendations || recommendations.length === 0) {
      throw new Error('No recommendations generated');
    }
    
    // Check recommendation structure
    const requiredFields = ['type', 'priority', 'title', 'description', 'expectedSavings', 'roi', 'confidence'];
    const validRecommendation = recommendations.every(rec => 
      requiredFields.every(field => rec.hasOwnProperty(field))
    );
    
    if (!validRecommendation) {
      throw new Error('Invalid recommendation structure');
    }
    
    // Check priority distribution
    const priorities = recommendations.map(r => r.priority);
    const uniquePriorities = [...new Set(priorities)];
    
    // Check ROI values
    const avgROI = recommendations.reduce((sum, r) => sum + r.roi, 0) / recommendations.length;
    
    console.log(`✅ Strategic recommendations validation:`);
    console.log(`   Total recommendations: ${recommendations.length}`);
    console.log(`   Priority levels: ${uniquePriorities.join(', ')}`);
    console.log(`   Average ROI: ${avgROI.toFixed(0)}%`);
    console.log(`   Recommendation types: ${[...new Set(recommendations.map(r => r.type))].join(', ')}`);
    
    // Display top recommendations
    console.log('\n   🎯 Top Recommendations:');
    recommendations.slice(0, 3).forEach((rec, index) => {
      console.log(`     ${index + 1}. ${rec.title} (${rec.priority} priority, ${rec.roi}% ROI)`);
    });
    
    return {
      success: true,
      message: `${recommendations.length} strategic recommendations validated`
    };
  } catch (error) {
    return {
      success: false,
      message: `Recommendations validation failed: ${error.message}`
    };
  }
}

/**
 * ⚡ Performance stress test
 */
async function performanceStressTest(vehicleId, currentData) {
  const testCount = 5;
  const responseTimes = [];
  let successCount = 0;
  
  try {
    console.log(`   Running ${testCount} concurrent prediction requests...`);
    
    const startTime = Date.now();
    const promises = Array.from({ length: testCount }, async (_, index) => {
      const requestStart = Date.now();
      try {
        const response = await axios.post(BASE_URL, {
          action: 'predict',
          vehicleId: `${vehicleId}-${index}`,
          currentData: {
            ...currentData,
            vehicleId: `${vehicleId}-${index}`
          }
        });
        
        const requestTime = Date.now() - requestStart;
        responseTimes.push(requestTime);
        
        if (response.data.success) {
          successCount++;
        }
        
        return { success: true, time: requestTime };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    const results = await Promise.all(promises);
    const totalTime = Date.now() - startTime;
    
    const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    const maxResponseTime = Math.max(...responseTimes);
    const minResponseTime = Math.min(...responseTimes);
    
    console.log(`✅ Stress test completed:`);
    console.log(`   Successful requests: ${successCount}/${testCount}`);
    console.log(`   Average response time: ${avgResponseTime.toFixed(0)}ms`);
    console.log(`   Min/Max response time: ${minResponseTime}ms / ${maxResponseTime}ms`);
    console.log(`   Total test time: ${totalTime}ms`);
    
    // Check performance thresholds
    if (avgResponseTime > config.maxResponseTime) {
      throw new Error(`Average response time ${avgResponseTime.toFixed(0)}ms exceeds threshold ${config.maxResponseTime}ms`);
    }
    
    if (successCount < testCount * 0.8) {
      throw new Error(`Success rate ${(successCount/testCount*100).toFixed(1)}% below 80% threshold`);
    }
    
    return {
      success: true,
      message: `Stress test passed: ${successCount}/${testCount} requests in ${avgResponseTime.toFixed(0)}ms avg`
    };
  } catch (error) {
    return {
      success: false,
      message: `Stress test failed: ${error.message}`
    };
  }
}

/**
 * 🎯 Test accuracy tracking
 */
async function testAccuracyTracking(predictions) {
  try {
    // Generate simulated actual consumption data
    const actualConsumption = predictions.map(pred => {
      // Add some realistic variation to predicted values
      const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
      return pred.predictedConsumption * (1 + variation);
    });
    
    const predictedConsumption = predictions.map(pred => pred.predictedConsumption);
    
    const response = await axios.post(BASE_URL, {
      action: 'update_accuracy',
      actualConsumption: actualConsumption,
      predictedConsumption: predictedConsumption
    });
    
    if (response.data.success) {
      const metrics = response.data.metrics;
      
      console.log(`✅ Accuracy tracking test:`);
      console.log(`   Model accuracy: ${metrics.avgAccuracy.toFixed(2)}%`);
      console.log(`   Total predictions: ${metrics.totalPredictions}`);
      console.log(`   Correct predictions: ${metrics.correctPredictions.toFixed(0)}`);
      console.log(`   Last accuracy check: ${new Date(metrics.lastAccuracyCheck).toLocaleString()}`);
      
      return {
        success: true,
        message: `Accuracy updated to ${metrics.avgAccuracy.toFixed(2)}%`
      };
    } else {
      throw new Error('Accuracy update failed');
    }
  } catch (error) {
    return {
      success: false,
      message: `Accuracy tracking failed: ${error.response?.data?.message || error.message}`
    };
  }
}

/**
 * 💾 Test cache functionality
 */
async function testCacheFunctionality(vehicleId) {
  try {
    // Test getting cached prediction
    const cacheResponse = await axios.get(`${BASE_URL}?action=cached_prediction&vehicleId=${vehicleId}`);
    
    if (cacheResponse.data.success) {
      console.log(`✅ Cache functionality test:`);
      console.log(`   Cached prediction found for vehicle: ${cacheResponse.data.vehicleId}`);
      console.log(`   Cache timestamp: ${new Date(cacheResponse.data.data.lastUpdated).toLocaleString()}`);
      
      // Test cache clearing
      const clearResponse = await axios.post(BASE_URL, {
        action: 'clear_cache'
      });
      
      if (clearResponse.data.success) {
        console.log(`   Cache cleared successfully`);
        
        return {
          success: true,
          message: 'Cache functionality working correctly'
        };
      } else {
        throw new Error('Cache clear failed');
      }
    } else {
      throw new Error('No cached prediction found');
    }
  } catch (error) {
    return {
      success: false,
      message: `Cache functionality failed: ${error.response?.data?.message || error.message}`
    };
  }
}

/**
 * 📊 Get model metrics
 */
async function getModelMetrics() {
  try {
    const response = await axios.get(`${BASE_URL}?action=metrics`);
    
    if (response.data.success) {
      const metrics = response.data.metrics;
      
      console.log(`✅ Model metrics retrieved:`);
      console.log(`   Model version: ${metrics.modelVersion}`);
      console.log(`   Total predictions: ${metrics.totalPredictions}`);
      console.log(`   Average accuracy: ${metrics.avgAccuracy.toFixed(2)}%`);
      console.log(`   Last accuracy check: ${new Date(metrics.lastAccuracyCheck).toLocaleString()}`);
      
      return {
        success: true,
        message: `Metrics retrieved with ${metrics.avgAccuracy.toFixed(2)}% accuracy`
      };
    } else {
      throw new Error('Failed to get metrics');
    }
  } catch (error) {
    return {
      success: false,
      message: `Metrics retrieval failed: ${error.response?.data?.message || error.message}`
    };
  }
}

/**
 * 📝 Log test result
 */
function logTestResult(testName, success, message) {
  performance.totalTests++;
  
  if (success) {
    performance.passedTests++;
    console.log(`✅ ${testName}: ${message}`);
  } else {
    performance.failedTests++;
    performance.errors.push({ test: testName, message });
    console.log(`❌ ${testName}: ${message}`);
  }
}

/**
 * 📊 Print test summary
 */
function printTestSummary() {
  const successRate = (performance.passedTests / performance.totalTests) * 100;
  const avgResponseTime = performance.averageResponseTime / performance.totalTests;
  
  console.log('\n🏁 ===== PREDICTIVE FUEL AI TEST SUMMARY =====\n');
  console.log(`📊 Test Results:`);
  console.log(`   Total Tests: ${performance.totalTests}`);
  console.log(`   Passed: ${performance.passedTests} ✅`);
  console.log(`   Failed: ${performance.failedTests} ❌`);
  console.log(`   Success Rate: ${successRate.toFixed(1)}%`);
  console.log(`   Average Response Time: ${avgResponseTime.toFixed(0)}ms`);
  
  if (performance.errors.length > 0) {
    console.log('\n❌ Failed Tests:');
    performance.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error.test}: ${error.message}`);
    });
  }
  
  // Final assessment
  if (successRate >= 90) {
    console.log('\n🎉 EXCELLENT: Predictive Fuel AI system is performing excellently!');
  } else if (successRate >= 80) {
    console.log('\n✅ GOOD: Predictive Fuel AI system is performing well with minor issues.');
  } else if (successRate >= 70) {
    console.log('\n⚠️ FAIR: Predictive Fuel AI system needs improvement.');
  } else {
    console.log('\n❌ POOR: Predictive Fuel AI system requires significant fixes.');
  }
  
  console.log('\n🧠 PredictiveFuelAI Testing Complete! 🚀\n');
}

// Run the tests
if (require.main === module) {
  runPredictiveFuelAITests().catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runPredictiveFuelAITests,
  getDemoData,
  trainModel,
  generatePredictions
};