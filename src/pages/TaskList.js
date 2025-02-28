import React from 'react';
import { Calendar, CheckSquare, Filter, Plus } from 'lucide-react';

const TaskList = () => {
  // Sample tasks data 
  const tasks = [
    { id: 1, title: 'Research React hooks', completed: true, due: '2025-02-26', category: 'Learning' },
    { id: 2, title: 'Create dashboard wireframes', completed: false, due: '2025-02-27', category: 'Design' },
    { id: 3, title: 'Complete coding challenge', completed: false, due: '2025-02-27', category: 'Practice' },
    { id: 4, title: 'Review portfolio feedback', completed: false, due: '2025-02-28', category: 'Career' },
    { id: 5, title: 'Morning workout routine', completed: true, due: '2025-02-27', category: 'Health' }
  ];

  return (
    <section className="pt-6 pb-12 md:pt-8 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
            Task <span className="text-indigo-600 dark:text-indigo-400">List</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl">
            Manage your daily tasks and stay productive with our intuitive task tracker.
          </p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-3">
            <button className="flex items-center gap-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Calendar size={16} /> 
              <span>Today</span>
            </button>
            <button className="flex items-center gap-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Filter size={16} /> 
              <span>Filter</span>
            </button>
          </div>
          
          <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-md">
            <Plus size={16} /> Add New Task
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-900/30 overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="p-6 md:p-8">
            <div className="flex items-center mb-6">
              <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full mr-4">
                <CheckSquare className="text-indigo-600 dark:text-indigo-400" size={20} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks for Today</h2>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {tasks.map(task => (
                <div 
                  key={task.id} 
                  className="py-4 flex items-center group hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg px-4 transition-colors"
                >
                  <div className={`relative flex items-center justify-center h-6 w-6 rounded-md ${
                    task.completed 
                      ? 'bg-indigo-100 dark:bg-indigo-900/30' 
                      : 'border-2 border-gray-300 dark:border-gray-600'
                  }`}>
                    <input 
                      type="checkbox" 
                      checked={task.completed}
                      className="h-4 w-4 text-indigo-600 dark:text-indigo-400 rounded border-gray-300 dark:border-gray-600 focus:ring-indigo-500 dark:focus:ring-indigo-400 z-10 opacity-0 absolute inset-0 cursor-pointer"
                    />
                    {task.completed && (
                      <CheckSquare size={14} className="text-indigo-600 dark:text-indigo-400" />
                    )}
                  </div>
                  
                  <div className="ml-4 flex-1">
                    <p className={`font-medium ${
                      task.completed 
                        ? 'line-through text-gray-400 dark:text-gray-500' 
                        : 'text-gray-800 dark:text-gray-200'
                    }`}>
                      {task.title}
                    </p>
                    <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar size={12} className="mr-1" />
                      <span>Due: {new Date(task.due).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}</span>
                    </div>
                  </div>
                  
                  <span className={`px-3 py-1 text-xs rounded-full ${
                    task.completed
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                  }`}>
                    {task.category}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <button className="flex items-center gap-2 border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-6 py-2 rounded-full text-sm font-medium transition-colors">
                View All Tasks
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TaskList;
