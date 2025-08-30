// Test Stack Auth connection
const fetch = require('node-fetch');

async function testStackAuth() {
  const projectId = '7b5d049c-562c-40df-8645-2eed5856c1cf';
  const publishableKey = process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY;
  
  console.log('Testing Stack Auth connection...');
  console.log('Project ID:', projectId);
  console.log('Has publishable key:', !!publishableKey);
  
  try {
    // Test API endpoint
    const response = await fetch(`https://api.stack-auth.com/api/v1/projects/${projectId}/users`, {
      method: 'GET',
      headers: {
        'x-stack-project-id': projectId,
        'x-stack-publishable-client-key': publishableKey || '',
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.text();
    console.log('Response body:', data);
    
  } catch (error) {
    console.error('Stack Auth test failed:', error);
  }
}

testStackAuth();
