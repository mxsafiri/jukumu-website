'use client';

import { useStackApp, useUser } from "@stackframe/stack";
import { useState } from "react";

export default function TestAuth() {
  const stackApp = useStackApp();
  const user = useUser();
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testSignUp = async () => {
    setLoading(true);
    try {
      console.log('Stack App:', stackApp);
      console.log('Project ID:', process.env.NEXT_PUBLIC_STACK_PROJECT_ID);
      
      const result = await stackApp.signUpWithCredential({
        email: 'test@example.com',
        password: 'testpassword123',
      });
      
      setResult(`Success: ${JSON.stringify(result, null, 2)}`);
    } catch (error: any) {
      console.error('Auth Error:', error);
      setResult(`Error: ${error.message}\n\nFull error: ${JSON.stringify(error, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Stack Auth Test</h1>
      
      <div className="mb-4">
        <p><strong>Current User:</strong> {user ? user.primaryEmail : 'Not logged in'}</p>
        <p><strong>Project ID:</strong> {process.env.NEXT_PUBLIC_STACK_PROJECT_ID}</p>
      </div>

      <button
        onClick={testSignUp}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Sign Up'}
      </button>

      {result && (
        <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-auto">
          {result}
        </pre>
      )}
    </div>
  );
}
