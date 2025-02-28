import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, CheckSquare, Award } from 'lucide-react';

const DashboardOverview = () => {
  const [quote, setQuote] = useState('');
  
  // Simulating fetching a motivational quote
  useEffect(() => {
    const quotes = [
      "The best way to predict the future is to create it.",
      "Small progress is still progress.",
      "Focus on the journey, not the destination.",
      "Success is the sum of small efforts repeated day in and day out."
    ];
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  const quickStats = [
    { 
      title: 'Goals in Progress', 
      value: '3', 
      icon: <Target size={20} />, 
      color: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' 
    },
    { 
      title: 'Tasks Completed', 
      value: '27/42', 
      icon: <CheckSquare size={20} />, 
      color: 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400' 
    },
    { 
      title: 'Progress', 
      value: '64%', 
      icon: <TrendingUp size={20} />, 
      color: 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400' 
    },
    { 
      title: 'Achievements', 
      value: '12', 
      icon: <Award size={20} />, 
      color: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400' 
    },
  ];

  return (
    <section className="pt-6 pb-12 md:pt-8 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
            Dashboard <span className="text-indigo-600 dark:text-indigo-400">Overview</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl">
            Track your goals, tasks, and overall progress at a glance.
          </p>
        </div>

        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-md p-6 md:p-8 text-white mb-6">
          <h2 className="text-2xl font-bold mb-2">Welcome back!</h2>
          <p className="opacity-90">You're making great progress toward your goals.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {quickStats.map((stat, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 overflow-hidden p-6 transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quote Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 overflow-hidden p-6 md:p-8 mb-6">
          <div className="flex items-center mb-4">
            <div className="bg-amber-100 dark:bg-amber-900/50 p-3 rounded-full mr-4">
              <Sparkles className="text-amber-500 dark:text-amber-400" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Today's Motivation</h2>
          </div>
          <blockquote className="border-l-4 border-indigo-300 dark:border-indigo-700 pl-4 italic text-gray-700 dark:text-gray-300 py-2">
            "{quote}"
          </blockquote>
        </div>

        {/* Upcoming Tasks Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 overflow-hidden p-6 md:p-8">
          <div className="flex items-center mb-6">
            <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full mr-4">
              <CheckSquare className="text-indigo-600 dark:text-indigo-400" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Today's Focus</h2>
          </div>
          <div className="space-y-4">
            {['Complete project proposal', 'Exercise for 30 minutes', 'Review weekly goals'].map((task, i) => (
              <div 
                key={i} 
                className="flex items-center p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <input 
                  type="checkbox" 
                  className="h-5 w-5 text-indigo-600 rounded border-gray-300 dark:border-gray-600 focus:ring-indigo-500"
                />
                <span className="ml-3 text-gray-700 dark:text-gray-200">{task}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Import the Target component which was missing
const Target = ({ size }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <circle cx="12" cy="12" r="6"></circle>
      <circle cx="12" cy="12" r="2"></circle>
    </svg>
  );
};

export default DashboardOverview;