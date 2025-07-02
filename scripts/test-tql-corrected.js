// Test TQL authentication with corrected scopes and endpoint
require('dotenv').config();

async function testTQLCorrected() {
  console.log('🔐 Testing TQL Authentication with Corrected Settings...');
  
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
  
  // Use corrected scopes from the email
  const scopes = [
    'https://tqlidentity.onmicrosoft.com/services_combined/LTLQuotes.Read',
    'https://tqlidentity.onmicrosoft.com/services_combined/LTLQuotes.Write'
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
    console.log('\n🚀 Attempting TQL authentication with corrected settings...');
    console.log(`🔗 Endpoint: https://public.api.tql.com/identity/token`);
    console.log(`📝 Scopes: ${scopes}`);
    
    const response = await fetch('https://public.api.tql.com/identity/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Ocp-Apim-Subscription-Key': process.env.NEXT_PUBLIC_TQL_SUBSCRIPTION_KEY
      },
      body: body.toString()
    });

    console.log(`📡 Response status: ${response.status}`);
    
    if (!response.ok) {
      const error = await response.text();
      console.log('❌ Authentication failed:');
      console.log(error);
      
      // If still failing, let's try without client credentials (maybe it's just username/password + subscription key)
      console.log('\n🚀 Trying alternative: username/password only...');
      
      const altBody = new URLSearchParams({
        grant_type: 'password',
        username: process.env.TQL_USERNAME,
        password: process.env.TQL_PASSWORD,
        scope: scopes
      });
      
      const altResponse = await fetch('https://public.api.tql.com/identity/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Ocp-Apim-Subscription-Key': process.env.NEXT_PUBLIC_TQL_SUBSCRIPTION_KEY
        },
        body: altBody.toString()
      });
      
      console.log(`📡 Alternative Response status: ${altResponse.status}`);
      
      if (altResponse.ok) {
        const token = await altResponse.json();
        console.log('✅ Alternative Authentication successful!');
        console.log(`🎫 Token type: ${token.token_type}`);
        console.log(`⏰ Expires in: ${token.expires_in} seconds`);
        console.log(`🔑 Access token: ${token.access_token.substring(0, 50)}...`);
        
        // Test the token with a quote request
        await testQuoteWithToken(token.access_token);
        
      } else {
        const altError = await altResponse.text();
        console.log('❌ Alternative also failed:', altError);
      }
      
      return;
    }

    const token = await response.json();
    console.log('✅ Authentication successful!');
    console.log(`🎫 Token type: ${token.token_type}`);
    console.log(`⏰ Expires in: ${token.expires_in} seconds`);
    console.log(`🔑 Access token: ${token.access_token.substring(0, 50)}...`);
    console.log(`📝 Scope: ${token.scope}`);
    
    // Test the token with a quote request
    await testQuoteWithToken(token.access_token);
    
  } catch (error) {
    console.log('❌ Authentication error:', error.message);
  }
}

async function testQuoteWithToken(accessToken) {
  console.log('\n📦 Testing quote creation with access token...');
  
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
      freightClass: "70",
      nmfc: "161030"
    }],
    shipmentDate: new Date().toISOString(),
    accessorials: ["LIFTGATE_DELIVERY"]
  };

  try {
    const response = await fetch(`${process.env.TQL_BASE_URL}/ltl/quotes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': process.env.NEXT_PUBLIC_TQL_SUBSCRIPTION_KEY,
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(testQuoteData)
    });

    console.log(`📡 Quote Response status: ${response.status}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Quote creation successful!');
      console.log('📦 Quote result:', JSON.stringify(result, null, 2));
    } else {
      const error = await response.text();
      console.log('❌ Quote creation failed:', error);
    }
  } catch (error) {
    console.log('❌ Quote test error:', error.message);
  }
}

testTQLCorrected();
