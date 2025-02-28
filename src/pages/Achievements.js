import React from 'react';
import { Award, Star, Zap, Trophy } from 'lucide-react';

// Define the missing Target component
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

const Achievements = () => {
  const achievements = [
    { id: 1, title: 'First Goal Set', description: 'Created your first goal', icon: <Target size={20} />, date: '2025-01-10', completed: true },
    { id: 2, title: '7-Day Streak', description: 'Used TymeLyne for 7 consecutive days', icon: <Zap size={20} />, date: '2025-01-16', completed: true },
    { id: 3, title: 'Goal Master', description: 'Completed 3 goals', icon: <Trophy size={20} />, date: '2025-02-05', completed: true },
    { id: 4, title: 'Task Champion', description: 'Completed 50 tasks', icon: <Star size={20} />, date: '2025-02-15', completed: false },
  ];

  return (
    <section className="pt-6 pb-12 md:pt-8 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
            Achievements <span className="text-indigo-600 dark:text-indigo-400">&amp; Rewards</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl">
            Track your accomplishments and earn rewards as you progress on your goal journey.
          </p>
        </div>
        
        {/* User Level Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 overflow-hidden p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full mr-4">
                <Award className="text-indigo-600 dark:text-indigo-400" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Level 12: Goal Explorer</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">4,250 XP</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Next Level: 5,000 XP (750 XP remaining)</p>
              <div className="w-40 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-indigo-600 dark:bg-indigo-500 h-3 rounded-full relative transition-all duration-700 ease-in-out"
                  style={{ width: '85%' }}
                >
                  <div className="absolute inset-0 bg-white/20 rounded-full bg-opacity-30 bg-gradient-to-r from-transparent to-white/20"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Achievements Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 overflow-hidden p-6 md:p-8 mb-6">
          <div className="flex items-center mb-6">
            <div className="bg-amber-100 dark:bg-amber-900/50 p-3 rounded-full mr-4">
              <Trophy className="text-amber-600 dark:text-amber-400" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Achievements</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {achievements.map(achievement => (
              <div 
                key={achievement.id} 
                className={`bg-white dark:bg-gray-700 rounded-lg shadow-sm p-5 border-l-4 ${
                  achievement.completed 
                    ? 'border-indigo-500 dark:border-indigo-400' 
                    : 'border-gray-300 dark:border-gray-600'
                } transition-all duration-300 hover:shadow-md group`}
              >
                <div className="flex gap-4">
                  <div className={`p-3 rounded-lg transition-all duration-300 group-hover:scale-110 ${
                    achievement.completed 
                      ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}>
                    {achievement.icon}
                  </div>
                  
                  <div>
                    <h3 className={`font-medium ${
                      achievement.completed 
                        ? 'text-gray-900 dark:text-white' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      {achievement.completed 
                        ? `Earned on ${new Date(achievement.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}` 
                        : 'Not yet earned'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Streaks */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 overflow-hidden p-6 md:p-8">
          <div className="flex items-center mb-6">
            <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full mr-4">
              <Zap className="text-green-600 dark:text-green-400" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Current Streaks</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl transition-transform duration-300 hover:-translate-y-1">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">14</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Daily Login</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl transition-transform duration-300 hover:-translate-y-1">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">8</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Task Completion</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl transition-transform duration-300 hover:-translate-y-1">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">5</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Goal Progress</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-xl transition-transform duration-300 hover:-translate-y-1">
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">3</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Weekly Reviews</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Achievements;
