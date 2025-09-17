import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "68c70f3b6f87f9c340448af6", 
  requiresAuth: true // Ensure authentication is required for all operations
});
