// Test the weight limit fix for large orders
require('dotenv').config();

async function testWeightLimitFix() {
  console.log('🧪 Testing Weight Limit Fix for Large Orders...\n');
  
  // Test different order sizes to verify the weight limit logic
  const testCases = [
    { quantity: 5000, expectedBehavior: 'USPS (18.6 lbs - under limit)' },
    { quantity: 10000, expectedBehavior: 'TQL → Error (77 lbs - over USPS limit)' },
    { quantity: 50000, expectedBehavior: 'TQL → Error (458 lbs - way over USPS limit)' }
  ];
  
  for (const testCase of testCases) {
    console.log(`📦 Testing ${testCase.quantity.toLocaleString()} dowels`);
    console.log(`🎯 Expected: ${testCase.expectedBehavior}`);
    
    const testData = {
      shippingAddress: {
        name: "Test Customer",
        address: "123 Main St",
        city: "Phoenix",
        state: "AZ",
        zip: "85001",
        country: "US"
      },
      cartItems: [
        {
          id: "force-dowels-1",
          name: "Force Dowels",
          quantity: testCase.quantity,
          tier: "Tier 1",
          pricePerUnit: 0.072
        }
      ]
    };
    
    try {
      console.log('🚀 Making API request...');
      
      const response = await fetch('http://localhost:3001/api/shipping/rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });
      
      console.log(`📡 Response Status: ${response.status}`);
      
      if (response.status === 401) {
        console.log('🔐 Authentication required - test needs to be run with auth');
      } else if (response.ok) {
        const data = await response.json();
        console.log('✅ Success! Rates received:');
        console.log(`   Provider: ${data.provider}`);
        console.log(`   Fallback Used: ${data.fallbackUsed ? 'Yes' : 'No'}`);
        console.log(`   Rates: ${data.rates ? data.rates.length : 0}`);
      } else {
        const errorText = await response.text();
        console.log('❌ Error Response:');
        
        try {
          const errorData = JSON.parse(errorText);
          console.log(`   Error: ${errorData.error}`);
          
          // Check if it's our expected weight limit error
          if (errorData.error && errorData.error.includes('LTL freight shipping')) {
            console.log('✅ Expected error: Weight limit protection working!');
          } else {
            console.log('❓ Unexpected error type');
          }
        } catch {
          console.log(`   Raw error: ${errorText.substring(0, 200)}...`);
        }
      }
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('🔌 Connection refused - server not running on port 3001');
      } else {
        console.log('❌ Request Error:', error.message);
      }
    }
    
    console.log('\n' + '-'.repeat(60) + '\n');
  }
}

testWeightLimitFix();
