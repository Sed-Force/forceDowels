// TQL API Authentication Service
export interface TQLToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

// Cache for storing the current token
let tokenCache: { token: TQLToken; expiresAt: number } | null = null;

/**
 * Get TQL access token with caching
 */
export async function getTQLToken(): Promise<TQLToken> {
  // Check if we have a valid cached token
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  // Use production scopes (confirmed working) - email was correct, documentation is outdated
  const scopes = [
    'https://tqlidentity.onmicrosoft.com/services_combined/LTLQuotes.Read',
    'https://tqlidentity.onmicrosoft.com/services_combined/LTLQuotes.Write'
  ].join(' ');

  const body = new URLSearchParams({
    client_id: process.env.TQL_CLIENT_ID!,
    client_secret: process.env.TQL_CLIENT_SECRET!,
    scope: scopes,
    grant_type: 'password',
    username: process.env.TQL_USERNAME!,
    password: process.env.TQL_PASSWORD!
  });

  try {
    const response = await fetch('https://public.api.tql.com/identity/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Ocp-Apim-Subscription-Key': process.env.NEXT_PUBLIC_TQL_SUBSCRIPTION_KEY!
      },
      body: body.toString()
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`TQL authentication failed: ${response.status} - ${error}`);
    }

    const token: TQLToken = await response.json();
    
    // Cache the token (expires 5 minutes before actual expiry for safety)
    const expiresAt = Date.now() + (token.expires_in - 300) * 1000;
    tokenCache = { token, expiresAt };
    
    return token;
  } catch (error) {
    console.error('TQL authentication error:', error);
    throw new Error('Failed to authenticate with TQL API');
  }
}

/**
 * Clear the token cache (useful for testing or error recovery)
 */
export function clearTQLTokenCache(): void {
  tokenCache = null;
}
