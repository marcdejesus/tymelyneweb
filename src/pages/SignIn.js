import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ThemeToggle from '../components/ThemeToggle';

function SignIn() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (email === '' || password === '') {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const { data, error: signInError } = await signIn(email, password);
      
      if (signInError) {
        setError(signInError.message || 'Failed to sign in');
        setLoading(false);
        return;
      }
      
      // Check if data exists before navigating
      if (data) {
        navigate('/dashboard');
      } else {
        setError('No response from authentication service');
        setLoading(false);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError(error.message || 'An error occurred during sign in');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 dark:text-white transition-colors duration-300">
      <Navbar />
      <div className="flex items-center justify-center min-h-screen py-20">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-96 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Sign In</h2>
          {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
              disabled={loading}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
              disabled={loading}
            />
          </div>
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm">
              <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                Forgot password?
              </a>
            </div>
          </div>
          <button 
            type="submit" 
            className="w-full bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors shadow-md"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <a href="/signup" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Sign up
            </a>
          </div>
        </form>
      </div>
      <Footer />
      <ThemeToggle />
    </div>
  );
}

export default SignIn;