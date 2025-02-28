import React from 'react';
import { TrendingUp, Calendar, ArrowRight } from 'lucide-react';

const ProgressTracker = () => {
  // Sample milestones data
  const milestones = [
    { id: 1, title: 'Project Kickoff', completed: true, date: '2025-01-15' },
    { id: 2, title: 'Design Approval', completed: true, date: '2025-01-30' },
    { id: 3, title: 'MVP Development', completed: true, date: '2025-02-20' },
    { id: 4, title: 'User Testing', completed: false, date: '2025-03-05' },
    { id: 5, title: 'Official Launch', completed: false, date: '2025-03-20' }
  ];

  // Calculate overall progress
  const completedCount = milestones.filter(m => m.completed).length;
  const progressPercentage = (completedCount / milestones.length) * 100;

  return (
    <section className="pt-6 pb-12 md:pt-8 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
            Progress <span className="text-indigo-600 dark:text-indigo-400">Tracker</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl">
            Visualize your journey and track milestones on the path to achieving your goals.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Overall Progress Card */}
          <div className="md:col-span-3 bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-900/30 overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="p-6 md:p-8">
              <div className="flex items-center mb-6">
                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full mr-4">
                  <TrendingUp className="text-indigo-600 dark:text-indigo-400" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Overall Progress</h2>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-5 mb-6">
                <div 
                  className="bg-indigo-600 dark:bg-indigo-500 h-5 rounded-full transition-all duration-700 ease-in-out relative"
                  style={{ width: `${progressPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 rounded-full bg-opacity-30 bg-gradient-to-r from-transparent to-white/20"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                <div className="text-center px-6 py-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
                  <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {Math.round(progressPercentage)}%
                  </span>
                  <span className="ml-2 text-indigo-600 dark:text-indigo-400 font-medium">Complete</span>
                </div>
              </div>
            </div>
          </div>

          {/* Milestone Timeline */}
          <div className="md:col-span-3 bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-900/30 overflow-hidden border border-gray-100 dark:border-gray-700 relative">
            <div className="absolute top-6 right-6 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
              Timeline View
            </div>
            <div className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Milestone Timeline</h2>
              
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                
                {/* Milestones */}
                <div className="space-y-10">
                  {milestones.map((milestone) => (
                    <div key={milestone.id} className="relative flex items-start group">
                      <div className={`absolute left-8 w-4 h-4 rounded-full mt-1.5 -ml-2 border-2 ${
                        milestone.completed 
                          ? 'bg-indigo-500 border-indigo-500 dark:bg-indigo-400 dark:border-indigo-400' 
                          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                        } transition-all duration-300 group-hover:scale-125`}></div>
                      
                      <div className="ml-16 transition-all duration-300 group-hover:translate-x-1">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                          <Calendar size={16} className="mr-2" />
                          <span>
                            {new Date(milestone.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        
                        <h3 className={`text-lg font-semibold ${
                          milestone.completed 
                            ? 'text-indigo-600 dark:text-indigo-400' 
                            : 'text-gray-800 dark:text-gray-200'
                        }`}>
                          {milestone.title}
                        </h3>
                        
                        <div className="mt-2 inline-block">
                          {milestone.completed ? (
                            <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                              Completed
                            </span>
                          ) : (
                            <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full text-sm font-medium">
                              Upcoming
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Action button similar to Hero */}
              <div className="mt-10 flex justify-center">
                <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white px-6 py-3 rounded-full text-lg font-medium transition-colors shadow-md">
                  View Detailed Progress
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProgressTracker;