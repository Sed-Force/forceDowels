// Test the unified shipping service directly (bypassing API authentication)
require('dotenv').config();

// Import the unified shipping service
const { UnifiedShippingService } = require('../lib/shipping-service.ts');

async function testUnifiedShipping() {
  console.log('🚚 Testing Unified Shipping Service Directly...');
  
  const shippingService = new UnifiedShippingService();
  
  // Test data for different quantities
  const testAddress = {
    name: "Test Customer",
    address: "123 Main St",
    city: "Phoenix",
    state: "AZ",
    zip: "85001",
    country: "US"
  };

  // Test 1: 5K dowels (should use USPS)
  console.log('\n📦 Test 1: 5K dowels (should use USPS)...');
  const cartItems5K = [{
    id: "force-dowels",
    name: "Force Dowels",
    quantity: 5000,
    tier: "Tier 1",
    pricePerUnit: 0.0275
  }];

  try {
    const rates5K = await shippingService.getShippingRates(testAddress, cartItems5K);
    console.log(`✅ 5K Test successful! Found ${rates5K.length} rates:`);
    rates5K.forEach((rate, index) => {
      console.log(`  ${index + 1}. ${rate.displayName}: $${rate.rate} (${rate.estimatedDelivery}) [${rate.provider}]`);
    });
  } catch (error) {
    console.log('❌ 5K Test failed:', error.message);
  }

  // Test 2: 10K dowels (should use TQL)
  console.log('\n📦 Test 2: 10K dowels (should use TQL)...');
  const cartItems10K = [{
    id: "force-dowels",
    name: "Force Dowels",
    quantity: 10000,
    tier: "Tier 1",
    pricePerUnit: 0.0275
  }];

  try {
    const rates10K = await shippingService.getShippingRates(testAddress, cartItems10K);
    console.log(`✅ 10K Test successful! Found ${rates10K.length} rates:`);
    rates10K.slice(0, 5).forEach((rate, index) => {
      console.log(`  ${index + 1}. ${rate.displayName}: $${rate.rate} (${rate.estimatedDelivery}) [${rate.provider}]`);
    });
    if (rates10K.length > 5) {
      console.log(`  ... and ${rates10K.length - 5} more rates`);
    }
  } catch (error) {
    console.log('❌ 10K Test failed:', error.message);
  }

  // Test 3: 50K dowels (should use TQL)
  console.log('\n📦 Test 3: 50K dowels (should use TQL)...');
  const cartItems50K = [{
    id: "force-dowels",
    name: "Force Dowels",
    quantity: 50000,
    tier: "Tier 2",
    pricePerUnit: 0.0225
  }];

  try {
    const rates50K = await shippingService.getShippingRates(testAddress, cartItems50K);
    console.log(`✅ 50K Test successful! Found ${rates50K.length} rates:`);
    rates50K.slice(0, 5).forEach((rate, index) => {
      console.log(`  ${index + 1}. ${rate.displayName}: $${rate.rate} (${rate.estimatedDelivery}) [${rate.provider}]`);
    });
    if (rates50K.length > 5) {
      console.log(`  ... and ${rates50K.length - 5} more rates`);
    }
  } catch (error) {
    console.log('❌ 50K Test failed:', error.message);
  }

  // Test provider selection logic
  console.log('\n📊 Testing Provider Selection Logic:');
  console.log(`  5K dowels -> ${UnifiedShippingService.getProviderForQuantity(5000)}`);
  console.log(`  10K dowels -> ${UnifiedShippingService.getProviderForQuantity(10000)}`);
  console.log(`  50K dowels -> ${UnifiedShippingService.getProviderForQuantity(50000)}`);
  console.log(`  100K dowels -> ${UnifiedShippingService.getProviderForQuantity(100000)}`);
}

// Run the test
testUnifiedShipping();
