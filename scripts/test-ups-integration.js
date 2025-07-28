// Test UPS integration with provided credentials
require('dotenv').config({ path: '.env.local' });

async function testUPSIntegration() {
  console.log('📦 Testing UPS Integration...');
  
  // Check environment variables
  const requiredVars = [
    'UPS_CLIENT_ID',
    'UPS_CLIENT_SECRET'
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
    console.log('\n❌ Missing required environment variables. Please check your .env.local file.');
    return;
  }
  
  // Test OAuth authentication
  console.log('\n🔐 Testing UPS OAuth Authentication...');

  try {
    // UPS uses Basic Auth with client_id:client_secret encoded in base64
    const credentials = Buffer.from(`${process.env.UPS_CLIENT_ID}:${process.env.UPS_CLIENT_SECRET}`).toString('base64');

    const params = new URLSearchParams({
      grant_type: 'client_credentials'
    });

    const response = await fetch('https://onlinetools.ups.com/security/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: params.toString(),
    });

    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ UPS OAuth failed:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ UPS OAuth successful!');
    console.log(`Token type: ${data.token_type}`);
    console.log(`Expires in: ${data.expires_in} seconds`);
    
    // Test a simple rating request
    console.log('\n📊 Testing UPS Rating API...');
    
    const ratingRequest = {
      RateRequest: {
        Request: {
          TransactionReference: {
            CustomerContext: "UPS Integration Test"
          }
        },
        PickupType: {
          Code: "01",
          Description: "Daily Pickup"
        },
        CustomerClassification: {
          Code: "04",
          Description: "Retail Rates"
        },
        Shipment: {
          Shipper: {
            Name: "Force Dowel Company",
            Address: {
              AddressLine: ["4455 E Nunneley Rd, Ste 103"],
              City: "Gilbert",
              StateProvinceCode: "AZ",
              PostalCode: "85296",
              CountryCode: "US"
            }
          },
          ShipTo: {
            Name: "Test Customer",
            Address: {
              AddressLine: ["123 Test St"],
              City: "Los Angeles",
              StateProvinceCode: "CA",
              PostalCode: "90210",
              CountryCode: "US"
            }
          },
          ShipFrom: {
            Name: "Force Dowel Company",
            Address: {
              AddressLine: ["4455 E Nunneley Rd, Ste 103"],
              City: "Gilbert",
              StateProvinceCode: "AZ",
              PostalCode: "85296",
              CountryCode: "US"
            }
          },

          Package: [{
            PackagingType: {
              Code: "02",
              Description: "Package"
            },
            Dimensions: {
              UnitOfMeasurement: {
                Code: "IN",
                Description: "Inches"
              },
              Length: "15",
              Width: "15",
              Height: "10"
            },
            PackageWeight: {
              UnitOfMeasurement: {
                Code: "LBS",
                Description: "Pounds"
              },
              Weight: "18.6"
            }
          }]
        }
      }
    };

    const ratingResponse = await fetch('https://onlinetools.ups.com/api/rating/v1/Shop', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.access_token}`,
        'transId': 'UPS-Test-' + Date.now(),
        'transactionSrc': 'Force Dowels Test'
      },
      body: JSON.stringify(ratingRequest),
    });

    console.log(`Rating API response status: ${ratingResponse.status}`);
    
    if (!ratingResponse.ok) {
      const errorText = await ratingResponse.text();
      console.error('❌ UPS Rating API failed:', errorText);
      return;
    }

    const ratingData = await ratingResponse.json();
    console.log('✅ UPS Rating API successful!');
    
    if (ratingData.RateResponse && ratingData.RateResponse.RatedShipment) {
      const shipments = Array.isArray(ratingData.RateResponse.RatedShipment) 
        ? ratingData.RateResponse.RatedShipment 
        : [ratingData.RateResponse.RatedShipment];
      
      console.log(`\n📦 Found ${shipments.length} shipping options:`);
      shipments.forEach((shipment, index) => {
        console.log(`${index + 1}. ${shipment.Service.Description}: $${shipment.TotalCharges.MonetaryValue}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testUPSIntegration().catch(console.error);
