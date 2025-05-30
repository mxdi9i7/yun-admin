'use client';

import { useState, useEffect } from 'react';
import { auth } from '../lib/supabase-utils';
import type { User } from '@supabase/supabase-js';

export default function SupabaseExample() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { user } = await auth.getCurrentUser();
      setUser(user);
    };
    checkUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_IN') {
        setMessage('Successfully signed in!');
      } else if (event === 'SIGNED_OUT') {
        setMessage('Successfully signed out!');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await auth.signUp(email, password);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('Check your email for the confirmation link!');
    }

    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await auth.signIn(email, password);

    if (error) {
      setMessage(`Error: ${error.message}`);
    }

    setLoading(false);
  };

  const handleSignOut = async () => {
    setLoading(true);
    const { error } = await auth.signOut();

    if (error) {
      setMessage(`Error: ${error.message}`);
    }

    setLoading(false);
  };

  if (user) {
    return (
      <div className='max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md'>
        <h2 className='text-2xl font-bold mb-4'>Welcome!</h2>
        <p className='mb-4'>Signed in as: {user.email}</p>
        <button
          onClick={handleSignOut}
          disabled={loading}
          className='w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:opacity-50'
        >
          {loading ? 'Signing out...' : 'Sign Out'}
        </button>
        {message && <p className='mt-4 text-sm text-green-600'>{message}</p>}
      </div>
    );
  }

  return (
    <div className='max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md'>
      <h2 className='text-2xl font-bold mb-4'>Supabase Auth Example</h2>

      <form className='space-y-4'>
        <div>
          <label
            htmlFor='email'
            className='block text-sm font-medium text-gray-700'
          >
            Email
          </label>
          <input
            type='email'
            id='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
            required
          />
        </div>

        <div>
          <label
            htmlFor='password'
            className='block text-sm font-medium text-gray-700'
          >
            Password
          </label>
          <input
            type='password'
            id='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
            required
          />
        </div>

        <div className='flex space-x-4'>
          <button
            type='submit'
            onClick={handleSignIn}
            disabled={loading}
            className='flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50'
          >
            {loading ? 'Loading...' : 'Sign In'}
          </button>

          <button
            type='button'
            onClick={handleSignUp}
            disabled={loading}
            className='flex-1 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50'
          >
            {loading ? 'Loading...' : 'Sign Up'}
          </button>
        </div>
      </form>

      {message && (
        <p
          className={`mt-4 text-sm ${
            message.includes('Error') ? 'text-red-600' : 'text-green-600'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
