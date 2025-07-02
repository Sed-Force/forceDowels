// Test TQL with staging environment and documentation examples
require('dotenv').config();

async function testTQLStaging() {
  console.log('🧪 Testing TQL with Staging Environment and Documentation Examples...\n');
  
  // Test with exact postal codes from documentation
  const docPostalCodes = [
    { origin: '11741', destination: '45203', description: 'Documentation Example (Holbrook, NY → Cincinnati, OH)' },
    { origin: '85296', destination: '45203', description: 'Force Dowels → Cincinnati, OH' },
    { origin: '11741', destination: '85001', description: 'Holbrook, NY → Phoenix, AZ' }
  ];
  
  // Get authentication token with dev scopes
  const scopes = [
    'https://tqlidentitydev.onmicrosoft.com/services_combined/LTLQuotes.Read',
    'https://tqlidentitydev.onmicrosoft.com/services_combined/LTLQuotes.Write'
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
    console.log('🔐 Getting authentication token with dev scopes...');
    
    const authResponse = await fetch('https://public.api.tql.com/identity/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Ocp-Apim-Subscription-Key': process.env.NEXT_PUBLIC_TQL_SUBSCRIPTION_KEY
      },
      body: authBody.toString()
    });

    if (!authResponse.ok) {
      const error = await authResponse.text();
      console.log('❌ Authentication failed with dev scopes:', error);
      
      // Try with production scopes as fallback
      console.log('\n🔄 Trying with production scopes...');
      
      const prodScopes = [
        'https://tqlidentity.onmicrosoft.com/services_combined/LTLQuotes.Read',
        'https://tqlidentity.onmicrosoft.com/services_combined/LTLQuotes.Write'
      ].join(' ');

      const prodAuthBody = new URLSearchParams({
        client_id: process.env.TQL_CLIENT_ID,
        client_secret: process.env.TQL_CLIENT_SECRET,
        scope: prodScopes,
        grant_type: 'password',
        username: process.env.TQL_USERNAME,
        password: process.env.TQL_PASSWORD
      });

      const prodAuthResponse = await fetch('https://public.api.tql.com/identity/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Ocp-Apim-Subscription-Key': process.env.NEXT_PUBLIC_TQL_SUBSCRIPTION_KEY
        },
        body: prodAuthBody.toString()
      });

      if (!prodAuthResponse.ok) {
        const prodError = await prodAuthResponse.text();
        console.log('❌ Authentication also failed with production scopes:', prodError);
        return;
      }

      const token = await prodAuthResponse.json();
      console.log('✅ Authentication successful with production scopes!');
      await testQuotesWithToken(token.access_token, docPostalCodes, false);
      return;
    }

    const token = await authResponse.json();
    console.log('✅ Authentication successful with dev scopes!');
    await testQuotesWithToken(token.access_token, docPostalCodes, true);
    
  } catch (error) {
    console.log('❌ Test error:', error.message);
  }
}

async function testQuotesWithToken(accessToken, postalCodes, useStaging) {
  console.log(`\n📦 Testing quotes with ${useStaging ? 'staging' : 'production'} environment...\n`);
  
  for (const testCase of postalCodes) {
    console.log(`🚚 Testing: ${testCase.description}`);
    console.log(`   Origin: ${testCase.origin} → Destination: ${testCase.destination}`);
    
    // Create quote with all required fields from documentation
    const testQuoteData = {
      origin: {
        postalCode: testCase.origin,
        country: "USA"
      },
      destination: {
        postalCode: testCase.destination,
        country: "USA"
      },
      quoteCommodities: [{
        description: "Force Dowels - 10000 units",
        weight: 77.0,
        dimensionLength: 16,
        dimensionWidth: 12,
        dimensionHeight: 12,
        quantity: 1,
        freightClassCode: "70",
        unitTypeCode: "BOX",
        nmfc: "161030"
      }],
      shipmentDate: new Date().toISOString(),
      pickLocationType: "Commercial",
      dropLocationType: "Commercial",
      accessorials: []
    };

    try {
      const endpoint = useStaging 
        ? 'https://public.api.tql.com/test-ltl/quotes'
        : 'https://public.api.tql.com/ltl/quotes';
      
      console.log(`🔗 Endpoint: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': process.env.NEXT_PUBLIC_TQL_SUBSCRIPTION_KEY,
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(testQuoteData)
      });

      console.log(`📡 Response status: ${response.status}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('🎉 SUCCESS! Quote created successfully!');
        console.log(`🆔 Quote ID: ${result.content.quoteId}`);
        
        if (result.content.carrierPrices && result.content.carrierPrices.length > 0) {
          console.log(`📋 Found ${result.content.carrierPrices.length} carrier rates:`);
          result.content.carrierPrices.slice(0, 3).forEach((rate, index) => {
            console.log(`  ${index + 1}. ${rate.carrier}: $${rate.customerRate} (${rate.transitDays} days)`);
          });
        }
        
        console.log('✅ This postal code combination works!\n');
        return true; // Success - stop testing
        
      } else {
        const error = await response.text();
        console.log('❌ Quote failed:');
        
        try {
          const errorData = JSON.parse(error);
          if (errorData.content) {
            const locationErrors = errorData.content.filter(e => e.code === 'LOCATION_MISMATCH');
            if (locationErrors.length > 0) {
              console.log('   Location mismatch (postal codes not in TQL system)');
            } else {
              console.log('   Other error:', errorData.content[0]?.message || 'Unknown');
            }
          }
        } catch {
          console.log('   Raw error:', error.substring(0, 200) + '...');
        }
      }
      
    } catch (err) {
      console.log('❌ Request error:', err.message);
    }
    
    console.log('\n' + '-'.repeat(50) + '\n');
  }
}

testTQLStaging();
