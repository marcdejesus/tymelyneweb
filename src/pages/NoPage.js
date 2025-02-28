import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ThemeToggle from '../components/ThemeToggle';

function NoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 dark:text-white transition-colors duration-300">
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen py-20 px-4 text-center">
        <div className="mb-6">
          <h1 className="text-9xl font-bold text-indigo-600 dark:text-indigo-400">404</h1>
          <div className="w-16 h-1 bg-indigo-600 dark:bg-indigo-400 mx-auto my-4"></div>
        </div>
        
        <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100">Page Not Found</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        
        <a 
          href="/" 
          className="bg-indigo-600 text-white px-8 py-3 rounded-full hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors shadow-md flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Home
        </a>
      </div>
      <Footer />
      <ThemeToggle />
    </div>
  );
}

export default NoPage;