// Test script to verify TQL authentication
// Run with: node scripts/test-tql-auth.js

require('dotenv').config();

async function testTQLAuth() {
  console.log('🔐 Testing TQL Authentication...');
  
  // Check environment variables
  const requiredVars = [
    'TQL_CLIENT_ID',
    'TQL_CLIENT_SECRET', 
    'TQL_USERNAME',
    'TQL_PASSWORD',
    'NEXT_PUBLIC_TQL_SUBSCRIPTION_KEY'
  ];
  
  console.log('\n📋 Checking environment variables:');
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: ${value.substring(0, 8)}...`);
    } else {
      console.log(`❌ ${varName}: Missing!`);
      return;
    }
  }
  
  // Test authentication
  const scopes = [
    'https://tqlidentitydev.onmicrosoft.com/services_combined/LTLQuotes.Read',
    'https://tqlidentitydev.onmicrosoft.com/services_combined/LTLQuotes.Write'
  ].join(' ');

  const body = new URLSearchParams({
    client_id: process.env.TQL_CLIENT_ID,
    client_secret: process.env.TQL_CLIENT_SECRET,
    scope: scopes,
    grant_type: 'password',
    username: process.env.TQL_USERNAME,
    password: process.env.TQL_PASSWORD
  });

  try {
    console.log('\n🚀 Method 1: Attempting Microsoft OAuth authentication...');

    const response1 = await fetch('https://login.microsoftonline.com/tqlidentitydev.onmicrosoft.com/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    });

    console.log(`📡 Microsoft OAuth Response status: ${response1.status}`);

    if (response1.ok) {
      const token = await response1.json();
      console.log('✅ Microsoft OAuth Authentication successful!');
      console.log(`🎫 Token type: ${token.token_type}`);
      console.log(`⏰ Expires in: ${token.expires_in} seconds`);
      console.log(`🔑 Access token: ${token.access_token.substring(0, 50)}...`);
      console.log(`📝 Scope: ${token.scope}`);
      return;
    } else {
      const error1 = await response1.text();
      console.log('❌ Microsoft OAuth failed:', error1);
    }

    // Try TQL's own authentication endpoint with subscription key
    console.log('\n🚀 Method 2: Attempting TQL direct authentication with subscription key...');

    const tqlAuthUrl = `${process.env.TQL_BASE_URL}/identity/token`;
    console.log(`🔗 TQL Auth URL: ${tqlAuthUrl}`);

    const response2 = await fetch(tqlAuthUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Ocp-Apim-Subscription-Key': process.env.NEXT_PUBLIC_TQL_SUBSCRIPTION_KEY
      },
      body: body.toString()
    });

    console.log(`📡 TQL Direct Response status: ${response2.status}`);

    if (response2.ok) {
      const token = await response2.json();
      console.log('✅ TQL Direct Authentication successful!');
      console.log(`🎫 Token type: ${token.token_type}`);
      console.log(`⏰ Expires in: ${token.expires_in} seconds`);
      console.log(`🔑 Access token: ${token.access_token.substring(0, 50)}...`);
      return;
    } else {
      const error2 = await response2.text();
      console.log('❌ TQL Direct failed:', error2);
    }

    // Try with just subscription key (some APIs work this way)
    console.log('\n🚀 Method 3: Testing subscription key only...');

    const testQuoteUrl = `${process.env.TQL_BASE_URL}/ltl/quotes`;
    console.log(`🔗 Test Quote URL: ${testQuoteUrl}`);

    const testQuoteData = {
      origin: {
        name: "Force Dowel Company",
        streetAddress: "4455 E Nunneley Rd, Ste 103",
        city: "Gilbert",
        state: "AZ",
        zip: "85296",
        country: "US"
      },
      destination: {
        name: "Test Customer",
        streetAddress: "123 Main St",
        city: "Phoenix",
        state: "AZ",
        zip: "85001",
        country: "US"
      },
      items: [{
        description: "Force Dowels - 10000 units",
        weight: 77,
        length: 16,
        width: 12,
        height: 12,
        pieces: 1,
        freightClass: "70"
      }],
      shipmentDate: new Date().toISOString()
    };

    const response3 = await fetch(testQuoteUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': process.env.NEXT_PUBLIC_TQL_SUBSCRIPTION_KEY
      },
      body: JSON.stringify(testQuoteData)
    });

    console.log(`📡 Subscription Key Test Response status: ${response3.status}`);

    if (response3.ok) {
      const result = await response3.json();
      console.log('✅ Subscription key authentication works!');
      console.log('📦 Quote result:', JSON.stringify(result, null, 2));
    } else {
      const error3 = await response3.text();
      console.log('❌ Subscription key test failed:', error3);
    }

  } catch (error) {
    console.log('❌ Authentication error:', error.message);
  }
}

testTQLAuth();
