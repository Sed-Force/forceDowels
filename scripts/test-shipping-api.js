// Test the actual shipping API endpoint
require('dotenv').config();

async function testShippingAPI() {
  console.log('🚚 Testing Shipping API Endpoint...');
  
  // Test data for a 10K dowel order (should use TQL)
  const testData = {
    shippingAddress: {
      name: "Test Customer",
      address: "123 Main St",
      city: "Phoenix",
      state: "AZ",
      zip: "85001",
      country: "US"
    },
    cartItems: [{
      id: "force-dowels",
      name: "Force Dowels",
      quantity: 10000,
      tier: "Tier 1",
      pricePerUnit: 0.0275
    }]
  };

  try {
    console.log('📦 Testing with 10K dowels (should use TQL)...');
    console.log('📋 Request data:', JSON.stringify(testData, null, 2));

    const response = await fetch('http://localhost:3000/api/shipping/rates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-test-mode': 'true'
      },
      body: JSON.stringify(testData)
    });

    console.log(`📡 Response status: ${response.status}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Shipping API successful!');
      console.log('📦 Response:', JSON.stringify(result, null, 2));
      
      if (result.rates && result.rates.length > 0) {
        console.log(`\n🚛 Found ${result.rates.length} shipping rates:`);
        result.rates.forEach((rate, index) => {
          console.log(`  ${index + 1}. ${rate.displayName}: $${rate.rate} (${rate.estimatedDelivery})`);
        });
        
        console.log(`\n📊 Provider Info:`);
        console.log(`  Expected Provider: ${result.expectedProvider}`);
        console.log(`  Actual Provider: ${result.provider}`);
        console.log(`  Fallback Used: ${result.fallbackUsed}`);
        console.log(`  Total Quantity: ${result.totalQuantity}`);
      }
    } else {
      const error = await response.text();
      console.log('❌ Shipping API failed:', error);
    }

    // Test with 5K dowels (should use USPS)
    console.log('\n\n📦 Testing with 5K dowels (should use USPS)...');
    
    const testData5K = {
      ...testData,
      cartItems: [{
        ...testData.cartItems[0],
        quantity: 5000
      }]
    };

    const response5K = await fetch('http://localhost:3000/api/shipping/rates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-test-mode': 'true'
      },
      body: JSON.stringify(testData5K)
    });

    console.log(`📡 5K Response status: ${response5K.status}`);
    
    if (response5K.ok) {
      const result5K = await response5K.json();
      console.log('✅ 5K Shipping API successful!');
      
      if (result5K.rates && result5K.rates.length > 0) {
        console.log(`\n📮 Found ${result5K.rates.length} USPS rates:`);
        result5K.rates.forEach((rate, index) => {
          console.log(`  ${index + 1}. ${rate.displayName}: $${rate.rate} (${rate.estimatedDelivery})`);
        });
        
        console.log(`\n📊 5K Provider Info:`);
        console.log(`  Expected Provider: ${result5K.expectedProvider}`);
        console.log(`  Actual Provider: ${result5K.provider}`);
        console.log(`  Fallback Used: ${result5K.fallbackUsed}`);
        console.log(`  Total Quantity: ${result5K.totalQuantity}`);
      }
    } else {
      const error5K = await response5K.text();
      console.log('❌ 5K Shipping API failed:', error5K);
    }

  } catch (error) {
    console.log('❌ Test error:', error.message);
  }
}

// Run the test
testShippingAPI();
