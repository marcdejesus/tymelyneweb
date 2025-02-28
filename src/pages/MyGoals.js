import React from 'react';
import { Target, Plus, Edit, Trash2, Calendar } from 'lucide-react';

const MyGoals = () => {
  // Sample goals data
  const goals = [
    { id: 1, title: 'Learn React & Tailwind', progress: 70, deadline: '2025-03-15' },
    { id: 2, title: 'Build 5 Portfolio Projects', progress: 40, deadline: '2025-06-30' },
    { id: 3, title: 'Complete Fitness Challenge', progress: 25, deadline: '2025-04-10' }
  ];

  return (
    <section className="pt-6 pb-12 md:pt-8 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
            My <span className="text-indigo-600 dark:text-indigo-400">Goals</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl">
            Define, track, and achieve your most important objectives.
          </p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div></div> {/* Empty div for flex spacing */}
          <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white px-5 py-3 rounded-full text-lg font-medium transition-colors shadow-md">
            <Plus size={18} /> Add New Goal
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {goals.map(goal => (
            <div 
              key={goal.id} 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 p-6 md:p-8 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between">
                <div className="flex items-center">
                  <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full mr-4">
                    <Target className="text-indigo-600 dark:text-indigo-400" size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{goal.title}</h3>
                </div>
                <div className="flex gap-3">
                  <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                    <Edit size={18} />
                  </button>
                  <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span className="font-medium">Progress</span>
                  <span className="font-bold">{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
                  <div 
                    className="bg-indigo-600 dark:bg-indigo-500 h-3 rounded-full transition-all duration-700 ease-in-out relative"
                    style={{ width: `${goal.progress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 rounded-full bg-opacity-30 bg-gradient-to-r from-transparent to-white/20"></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex items-center">
                <div className="bg-gray-100 dark:bg-gray-700 p-1.5 rounded-full mr-2">
                  <Calendar size={14} className="text-gray-600 dark:text-gray-400" />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Deadline: {new Date(goal.deadline).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MyGoals;