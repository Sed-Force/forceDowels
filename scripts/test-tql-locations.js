// Test different postal codes to find valid TQL locations
require('dotenv').config();

async function testTQLLocations() {
  console.log('🗺️  Testing TQL with Different Postal Codes...');
  
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
    
    // Test different postal code combinations
    const testLocations = [
      // Major cities that TQL likely serves
      { name: "Cincinnati, OH (TQL HQ)", zip: "45202" },
      { name: "Chicago, IL", zip: "60601" },
      { name: "Atlanta, GA", zip: "30309" },
      { name: "Dallas, TX", zip: "75201" },
      { name: "Los Angeles, CA", zip: "90001" },
      { name: "New York, NY", zip: "10001" },
      { name: "Phoenix, AZ", zip: "85001" },
      { name: "Denver, CO", zip: "80202" },
      { name: "Miami, FL", zip: "33101" },
      { name: "Seattle, WA", zip: "98101" }
    ];
    
    console.log('\n🧪 Testing postal codes...');
    
    for (const origin of testLocations.slice(0, 3)) { // Test first 3 as origins
      for (const destination of testLocations.slice(3, 6)) { // Test next 3 as destinations
        console.log(`\n🚚 Testing: ${origin.name} (${origin.zip}) → ${destination.name} (${destination.zip})`);
        
        const testQuote = {
          origin: {
            postalCode: origin.zip
          },
          destination: {
            postalCode: destination.zip
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
        
        try {
          const response = await fetch(`${process.env.TQL_BASE_URL}/ltl/quotes`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Ocp-Apim-Subscription-Key': process.env.NEXT_PUBLIC_TQL_SUBSCRIPTION_KEY,
              'Authorization': `Bearer ${token.access_token}`
            },
            body: JSON.stringify(testQuote)
          });
          
          console.log(`📡 Status: ${response.status}`);
          
          if (response.ok) {
            const result = await response.json();
            console.log('🎉 SUCCESS! Found working postal codes!');
            console.log(`✅ Origin: ${origin.name} (${origin.zip})`);
            console.log(`✅ Destination: ${destination.name} (${destination.zip})`);
            console.log('📦 Quote result:');
            console.log(JSON.stringify(result, null, 2));
            return; // Stop on first success
          } else {
            const error = await response.text();
            const errorObj = JSON.parse(error);
            if (errorObj.content) {
              const locationErrors = errorObj.content.filter(e => e.code === 'LOCATION_MISMATCH');
              if (locationErrors.length === 0) {
                console.log('✅ Postal codes are valid! Other error:', error);
              } else {
                console.log('❌ Location mismatch');
              }
            }
          }
        } catch (err) {
          console.log('❌ Request error:', err.message);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log('\n🤔 No working postal code combinations found. TQL might have specific service areas.');
    console.log('💡 Suggestion: Contact TQL support to get valid postal codes for testing.');
    
  } catch (error) {
    console.log('❌ Test error:', error.message);
  }
}

testTQLLocations();
