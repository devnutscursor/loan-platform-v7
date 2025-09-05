'use client'

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function TestInvitePage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const testInvite = async () => {
    setLoading(true);
    setResult('');

    try {
      const response = await fetch('/api/send-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: 'Test Company',
          adminEmail: email,
          website: 'https://test.com'
        }),
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Test Invite System</h1>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="Enter email to test invite"
          />
        </div>

        <button
          onClick={testInvite}
          disabled={loading || !email}
          className="w-full bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Test Invite'}
        </button>

        {result && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <h3 className="font-medium mb-2">Result:</h3>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">{result}</pre>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-600">
          <p><strong>Steps to test:</strong></p>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Enter your email address</li>
            <li>Click "Send Test Invite"</li>
            <li>Check your email for the invite</li>
            <li>Click the invite link</li>
            <li>Set your password</li>
            <li>Verify you're redirected to dashboard</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
