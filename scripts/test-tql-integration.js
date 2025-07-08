// Test TQL integration with proper environment variables and API structure
require('dotenv').config();

async function testTQLIntegration() {
  console.log('🚚 Testing TQL Integration with Updated Structure...');
  
  // Check environment variables
  const requiredVars = [
    'NEXT_PUBLIC_TQL_SUBSCRIPTION_KEY',
    'TQL_CLIENT_ID',
    'TQL_CLIENT_SECRET', 
    'TQL_USERNAME',
    'TQL_PASSWORD',
    'TQL_BASE_URL'
  ];
  
  console.log('\n📋 Checking environment variables:');
  let missingVars = [];
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: ${value.substring(0, 8)}...`);
    } else {
      console.log(`❌ ${varName}: Missing!`);
      missingVars.push(varName);
    }
  }
  
  if (missingVars.length > 0) {
    console.log('\n❌ Missing required environment variables. Please add them to .env.local:');
    missingVars.forEach(varName => {
      console.log(`${varName}=your_value_here`);
    });
    return;
  }
  
  // Test authentication
  console.log('\n🔐 Testing TQL Authentication...');
  
  const scopes = [
    'https://tqlidentity.onmicrosoft.com/services_combined/LTLQuotes.Read',
    'https://tqlidentity.onmicrosoft.com/services_combined/LTLQuotes.Write'
  ].join(' ');

  const authBody = new URLSearchParams({
    client_id: process.env.TQL_CLIENT_ID,
    client_secret: process.env.TQL_CLIENT_SECRET,
    scope: scopes,
    grant_type: 'password',
    username: process.env.TQL_USERNAME,
    password: process.env.TQL_PASSWORD
  });

  try {
    const authResponse = await fetch('https://public.api.tql.com/identity/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Ocp-Apim-Subscription-Key': process.env.NEXT_PUBLIC_TQL_SUBSCRIPTION_KEY
      },
      body: authBody.toString()
    });

    console.log(`🔑 Auth Response status: ${authResponse.status}`);
    
    if (!authResponse.ok) {
      const error = await authResponse.text();
      console.log('❌ Authentication failed:', error);
      return;
    }

    const token = await authResponse.json();
    console.log('✅ Authentication successful!');
    console.log(`🎫 Token type: ${token.token_type}`);
    console.log(`⏰ Expires in: ${token.expires_in} seconds`);

    // Test quote creation with proper structure
    console.log('\n📦 Testing Quote Creation...');
    
    const testQuoteData = {
      origin: {
        city: "Gilbert",
        state: "AZ",
        postalCode: "85296",
        country: "USA"
      },
      destination: {
        city: "Phoenix",
        state: "AZ", 
        postalCode: "85001",
        country: "USA"
      },
      quoteCommodities: [{
        description: "Force Dowels - 10,000 units (Tier 1)",
        weight: 77.0,
        dimensionLength: 16,
        dimensionWidth: 12,
        dimensionHeight: 12,
        quantity: 1,
        freightClassCode: "70",
        unitTypeCode: "PLT",
        nmfc: "161030",
        isHazmat: false,
        isStackable: true
      }],
      pickLocationType: "Commercial",
      dropLocationType: "Commercial",
      accessorials: [],
      shipmentDate: new Date().toISOString()
    };

    console.log('📋 Quote data:', JSON.stringify(testQuoteData, null, 2));

    const quoteResponse = await fetch(`${process.env.TQL_BASE_URL}/ltl/quotes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': process.env.NEXT_PUBLIC_TQL_SUBSCRIPTION_KEY,
        'Authorization': `Bearer ${token.access_token}`
      },
      body: JSON.stringify(testQuoteData)
    });

    console.log(`📡 Quote Response status: ${quoteResponse.status}`);
    
    if (quoteResponse.ok) {
      const result = await quoteResponse.json();
      console.log('✅ Quote creation successful!');
      console.log('📦 Quote result:');
      console.log(JSON.stringify(result, null, 2));
      
      if (result.content && result.content.rates) {
        console.log(`\n🚛 Found ${result.content.rates.length} shipping rates:`);
        result.content.rates.forEach((rate, index) => {
          console.log(`  ${index + 1}. ${rate.carrierName} ${rate.serviceType}: $${rate.totalCost} (${rate.transitDays} days)`);
        });
      }
    } else {
      const error = await quoteResponse.text();
      console.log('❌ Quote creation failed:', error);
      
      // Try to parse error for more details
      try {
        const errorObj = JSON.parse(error);
        console.log('📋 Error details:', JSON.stringify(errorObj, null, 2));
      } catch (e) {
        console.log('📋 Raw error:', error);
      }
    }

  } catch (error) {
    console.log('❌ Test error:', error.message);
  }
}

// Run the test
testTQLIntegration();
