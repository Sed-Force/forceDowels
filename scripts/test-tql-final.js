// Final test with all corrections
require('dotenv').config();

async function testTQLFinal() {
  console.log('🎯 Final TQL Test with All Corrections...');
  
  // Get authentication token
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
    console.log('🔐 Getting authentication token...');
    
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
      console.log('❌ Authentication failed:', error);
      return;
    }

    const token = await authResponse.json();
    console.log('✅ Authentication successful!');
    
    // Test quote with fully corrected format
    console.log('\n📦 Creating quote with fully corrected format...');
    
    const testQuoteData = {
      origin: {
        name: "Force Dowel Company",
        streetAddress: "4455 E Nunneley Rd, Ste 103",
        city: "Gilbert",
        state: "AZ",
        postalCode: "85296",
        country: "US"
      },
      destination: {
        name: "Test Customer",
        streetAddress: "123 Main St",
        city: "Los Angeles", // Try a different city that might be in TQL's system
        state: "CA",
        postalCode: "90210",
        country: "US"
      },
      quoteCommodities: [{
        description: "Force Dowels - 10000 units",
        weight: 77,
        dimensionLength: 16,
        dimensionWidth: 12,
        dimensionHeight: 12,
        quantity: 1,
        freightClassCode: "70",
        nmfc: "161030"
      }],
      shipmentDate: new Date().toISOString(),
      accessorials: []
    };

    console.log('📋 Final quote data:', JSON.stringify(testQuoteData, null, 2));

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
      console.log('🎉 QUOTE CREATION SUCCESSFUL!');
      console.log('📦 Quote result:');
      console.log(JSON.stringify(result, null, 2));
      
      // Analyze the response structure
      if (result.content) {
        console.log('\n📊 Quote Analysis:');
        console.log(`🆔 Quote ID: ${result.content.quoteId}`);
        
        if (result.content.rates && result.content.rates.length > 0) {
          console.log(`📋 Found ${result.content.rates.length} rates:`);
          result.content.rates.forEach((rate, index) => {
            console.log(`  ${index + 1}. ${rate.carrierName} ${rate.serviceType}: $${rate.totalCost} (${rate.transitDays} days)`);
          });
        }
      }
      
    } else {
      const error = await quoteResponse.text();
      console.log('❌ Quote creation failed:', error);
      
      // Try with minimal data to see what works
      console.log('\n🔄 Trying with minimal data...');
      
      const minimalQuote = {
        origin: {
          postalCode: "85296"
        },
        destination: {
          postalCode: "90210"
        },
        quoteCommodities: [{
          description: "Force Dowels",
          weight: 77,
          dimensionLength: 16,
          dimensionWidth: 12,
          dimensionHeight: 12,
          quantity: 1,
          freightClassCode: "70"
        }]
      };
      
      const minimalResponse = await fetch(`${process.env.TQL_BASE_URL}/ltl/quotes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': process.env.NEXT_PUBLIC_TQL_SUBSCRIPTION_KEY,
          'Authorization': `Bearer ${token.access_token}`
        },
        body: JSON.stringify(minimalQuote)
      });
      
      console.log(`📡 Minimal Response status: ${minimalResponse.status}`);
      
      if (minimalResponse.ok) {
        const minimalResult = await minimalResponse.json();
        console.log('✅ Minimal quote worked!');
        console.log(JSON.stringify(minimalResult, null, 2));
      } else {
        const minimalError = await minimalResponse.text();
        console.log('❌ Minimal quote also failed:', minimalError);
      }
    }
    
  } catch (error) {
    console.log('❌ Test error:', error.message);
  }
}

testTQLFinal();
