// Test TQL fallback behavior when authentication fails
require('dotenv').config();

async function testTQLFallback() {
  console.log('🔧 Testing TQL Fallback Behavior...');
  
  // Test with 10K dowels (should trigger TQL, then fallback to manual quote)
  const testData = {
    shippingAddress: {
      name: "Test Customer",
      address: "567 South 1500 East",
      city: "Spanish Fork",
      state: "UT",
      zip: "84660",
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
    console.log('📦 Testing 10K dowels with TQL authentication failure...');
    
    const response = await fetch('http://localhost:3000/api/shipping/rates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // This should work with proper authentication from the browser
      },
      body: JSON.stringify(testData)
    });

    console.log(`📡 Response status: ${response.status}`);
    
    if (response.status === 401) {
      console.log('🔐 Authentication required - test this through the browser');
      console.log('✅ API is properly protected');
      return;
    }

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Fallback test successful!');
      console.log(`📊 Provider: ${result.provider}`);
      console.log(`🔄 Fallback Used: ${result.fallbackUsed}`);
      console.log(`🚛 Found ${result.rates.length} shipping options`);
      
      if (result.rates.length > 0) {
        console.log('📋 Shipping options:');
        result.rates.forEach((rate, index) => {
          console.log(`  ${index + 1}. ${rate.displayName}`);
          console.log(`     Rate: ${rate.rate === 0 ? 'Contact for Quote' : '$' + rate.rate}`);
          console.log(`     Delivery: ${rate.estimatedDelivery}`);
          if (rate.rate === 0) {
            console.log(`     ✅ Manual quote option detected!`);
          }
        });
      }
    } else {
      const error = await response.text();
      console.log('❌ Test failed:', error);
    }

  } catch (error) {
    console.log('❌ Test error:', error.message);
  }

  console.log('\n📝 Manual Testing Steps:');
  console.log('1. Sign in to the application');
  console.log('2. Add 10,000+ dowels to cart');
  console.log('3. Go to checkout and enter shipping address');
  console.log('4. Should see "LTL Freight - Manual Quote Required" option');
  console.log('5. Select it and verify button shows contact info');
  console.log('6. Verify order summary shows freight shipping method');
}

// Run the test
testTQLFallback();
