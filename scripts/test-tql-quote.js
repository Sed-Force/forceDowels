// Test TQL quote creation with corrected data format
require('dotenv').config();

async function testTQLQuote() {
  console.log('📦 Testing TQL Quote Creation with Corrected Format...');
  
  // First get authentication token
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
    console.log(`🔑 Token expires in: ${token.expires_in} seconds`);
    
    // Test quote with corrected format
    console.log('\n📦 Creating quote with corrected format...');
    
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
        city: "Phoenix",
        state: "AZ",
        postalCode: "85001",
        country: "US"
      },
      quoteCommodities: [{
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
      accessorials: []
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
      
      // Test retrieving the quote
      if (result.content && result.content.quoteId) {
        console.log(`\n🔍 Testing quote retrieval for ID: ${result.content.quoteId}`);
        
        const getQuoteResponse = await fetch(`${process.env.TQL_BASE_URL}/ltl/quotes/${result.content.quoteId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': process.env.NEXT_PUBLIC_TQL_SUBSCRIPTION_KEY,
            'Authorization': `Bearer ${token.access_token}`
          }
        });
        
        console.log(`📡 Get Quote Response status: ${getQuoteResponse.status}`);
        
        if (getQuoteResponse.ok) {
          const getResult = await getQuoteResponse.json();
          console.log('✅ Quote retrieval successful!');
          console.log('📋 Retrieved quote:', JSON.stringify(getResult, null, 2));
        } else {
          const getError = await getQuoteResponse.text();
          console.log('❌ Quote retrieval failed:', getError);
        }
      }
      
    } else {
      const error = await quoteResponse.text();
      console.log('❌ Quote creation failed:', error);
    }
    
  } catch (error) {
    console.log('❌ Test error:', error.message);
  }
}

testTQLQuote();
