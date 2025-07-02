// Simple test to see what TQL API expects
require('dotenv').config();

async function testTQLSimple() {
  console.log('🔍 Testing TQL API endpoints to understand authentication...');
  
  const baseUrl = process.env.TQL_BASE_URL;
  const subscriptionKey = process.env.NEXT_PUBLIC_TQL_SUBSCRIPTION_KEY;
  
  console.log(`🌐 Base URL: ${baseUrl}`);
  console.log(`🔑 Subscription Key: ${subscriptionKey.substring(0, 8)}...`);
  
  // Test different endpoints to see what they expect
  const endpoints = [
    '/ltl/quotes',
    '/ltl/quotes/test',
    '/identity/token',
    '/api/ltl/quotes',
    '/v1/ltl/quotes'
  ];
  
  for (const endpoint of endpoints) {
    const url = `${baseUrl}${endpoint}`;
    console.log(`\n🚀 Testing: ${url}`);
    
    try {
      // Test with just subscription key
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Ocp-Apim-Subscription-Key': subscriptionKey,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`📡 Status: ${response.status}`);
      
      if (response.status === 200) {
        const data = await response.json();
        console.log('✅ Success!', data);
      } else if (response.status === 405) {
        console.log('ℹ️  Method not allowed (endpoint exists but needs POST)');
      } else if (response.status === 404) {
        console.log('❌ Not found');
      } else if (response.status === 401) {
        console.log('🔐 Unauthorized (needs authentication)');
      } else if (response.status === 400) {
        const error = await response.text();
        console.log('⚠️  Bad request:', error);
      } else {
        const error = await response.text();
        console.log(`❓ Status ${response.status}:`, error);
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
  }
  
  // Try a POST to the quotes endpoint with minimal data
  console.log('\n🚀 Testing POST to /ltl/quotes with minimal data...');
  
  const minimalQuote = {
    origin: {
      zip: "85296"
    },
    destination: {
      zip: "85001"
    },
    items: [{
      weight: 100,
      freightClass: "70"
    }]
  };
  
  try {
    const response = await fetch(`${baseUrl}/ltl/quotes`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': subscriptionKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(minimalQuote)
    });
    
    console.log(`📡 POST Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ POST Success!', JSON.stringify(data, null, 2));
    } else {
      const error = await response.text();
      console.log('❌ POST Error:', error);
    }
  } catch (error) {
    console.log('❌ POST Exception:', error.message);
  }
}

testTQLSimple();
