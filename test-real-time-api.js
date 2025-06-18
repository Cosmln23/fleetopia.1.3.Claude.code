// Test script for the real-time API endpoint
// Run this with: node test-real-time-api.js

const baseURL = 'http://localhost:3005';

async function testAPI() {
  console.log('🧪 Testing Real-time API Endpoints...\n');

  // Test 1: Health Check
  try {
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${baseURL}/api/real-time/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }

  // Test 2: Demo Data
  try {
    console.log('\n2. Testing demo data endpoint...');
    const demoResponse = await fetch(`${baseURL}/api/real-time/data?demo=true`);
    const demoData = await demoResponse.json();
    console.log('✅ Demo data:', {
      vehicleCount: demoData.vehicles?.length || 0,
      isDemo: demoData.isDemo,
      message: demoData.message
    });
  } catch (error) {
    console.log('❌ Demo data failed:', error.message);
  }

  // Test 3: Regular Data (without auth - should return demo)
  try {
    console.log('\n3. Testing regular endpoint (no auth)...');
    const regularResponse = await fetch(`${baseURL}/api/real-time/data`);
    const regularData = await regularResponse.json();
    console.log('✅ Regular endpoint:', {
      vehicleCount: regularData.vehicles?.length || 0,
      isDemo: regularData.isDemo,
      message: regularData.message
    });
  } catch (error) {
    console.log('❌ Regular endpoint failed:', error.message);
  }

  console.log('\n🎉 API Tests Complete!');
}

// Only run if this is the main module
if (require.main === module) {
  testAPI().catch(console.error);
}

module.exports = testAPI;