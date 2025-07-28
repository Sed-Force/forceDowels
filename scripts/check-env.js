#!/usr/bin/env node

/**
 * Environment Variables Checker
 * 
 * This script checks if all required environment variables are set
 * for the Force Dowels application to work properly.
 */

console.log('🔍 Checking Force Dowels Environment Variables...\n');

const requiredVars = [
  {
    name: 'DATABASE_URL',
    description: 'PostgreSQL database connection string',
    example: 'postgresql://username:password@host:port/database',
    required: true
  },
  {
    name: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    description: 'Clerk authentication publishable key',
    example: 'pk_test_...',
    required: true
  },
  {
    name: 'CLERK_SECRET_KEY',
    description: 'Clerk authentication secret key',
    example: 'sk_test_...',
    required: true
  },
  {
    name: 'STRIPE_PUBLISHABLE_KEY',
    description: 'Stripe publishable key',
    example: 'pk_test_...',
    required: true
  },
  {
    name: 'STRIPE_SECRET_KEY',
    description: 'Stripe secret key',
    example: 'sk_test_...',
    required: true
  },
  {
    name: 'RESEND_API_KEY',
    description: 'Resend email service API key',
    example: 're_...',
    required: true
  },
  {
    name: 'UPS_CLIENT_ID',
    description: 'UPS API client ID for shipping calculations',
    example: 'your_ups_client_id',
    required: true
  },
  {
    name: 'UPS_CLIENT_SECRET',
    description: 'UPS API client secret for shipping calculations',
    example: 'your_ups_client_secret',
    required: true
  },
  {
    name: 'NEXT_PUBLIC_BASE_URL',
    description: 'Base URL of your application',
    example: 'http://localhost:3000',
    required: false
  },
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    description: 'Stripe webhook endpoint secret',
    example: 'whsec_...',
    required: false
  }
];

let allGood = true;
let missingRequired = [];

console.log('📋 Environment Variables Status:\n');

requiredVars.forEach(variable => {
  const value = process.env[variable.name];
  const isSet = !!value;
  const status = isSet ? '✅' : (variable.required ? '❌' : '⚠️');
  
  console.log(`${status} ${variable.name}`);
  console.log(`   Description: ${variable.description}`);
  
  if (isSet) {
    // Show partial value for security
    const displayValue = value.length > 20 
      ? `${value.substring(0, 10)}...${value.substring(value.length - 4)}`
      : value;
    console.log(`   Value: ${displayValue}`);
  } else {
    console.log(`   Example: ${variable.example}`);
    if (variable.required) {
      missingRequired.push(variable);
      allGood = false;
    }
  }
  console.log('');
});

if (allGood) {
  console.log('🎉 All required environment variables are set!');
  console.log('\n📝 Next steps:');
  console.log('   1. Run: npm run db:init');
  console.log('   2. Run: npm run dev');
  console.log('   3. Visit: http://localhost:3000/admin/database');
} else {
  console.log('❌ Missing required environment variables!\n');
  console.log('📝 Please add these to your .env.local file:\n');
  
  missingRequired.forEach(variable => {
    console.log(`${variable.name}=${variable.example}`);
  });
  
  console.log('\n💡 Quick setup guides:');
  console.log('   • Database: https://neon.tech (free PostgreSQL)');
  console.log('   • Auth: https://clerk.com (free tier available)');
  console.log('   • Payments: https://stripe.com (test mode)');
  console.log('   • Email: https://resend.com (free tier available)');
  
  process.exit(1);
}
