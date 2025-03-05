import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, CheckSquare, Award } from 'lucide-react';
import supabase from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Target } from 'lucide-react'; // Import Target from lucide-react instead of custom component

const DashboardOverview = () => {
  const [quote, setQuote] = useState('');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    goals: { inProgress: 0 },
    tasks: { completed: 0, total: 0 },
    progress: 0,
    achievements: 0,
    userName: '',
    todaysTasks: []
  });
  
  const { user } = useAuth();
  
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

  // Fetch user-specific dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Get user profile info
        const { data: profileData } = await supabase
          .from('profiles')
          .select('first_name, last_name, username')
          .eq('id', user.id)
          .single();
          
        // Get goals in progress count
        const { data: goalsData, error: goalsError } = await supabase
          .from('goals')
          .select('id')
          .eq('user_id', user.id)
          .eq('completed', false);
          
        if (goalsError) throw goalsError;
        
        // Get tasks stats
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('id, completed')
          .eq('user_id', user.id);
          
        if (tasksError) throw tasksError;
        
        // Get today's tasks
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { data: todaysTasks, error: todaysTasksError } = await supabase
          .from('tasks')
          .select('id, title, completed')
          .eq('user_id', user.id)
          .gte('due_date', today.toISOString())
          .lt('due_date', new Date(today.getTime() + 86400000).toISOString())
          .order('completed', { ascending: true });
          
        if (todaysTasksError) throw todaysTasksError;
        
        // Get achievements count
        const { data: achievementsData, error: achievementsError } = await supabase
          .from('user_achievements')
          .select('id')
          .eq('user_id', user.id);
          
        if (achievementsError) throw achievementsError;
        
        // Calculate task completion percentage
        const completedTasks = tasksData.filter(task => task.completed).length;
        const totalTasks = tasksData.length;
        const progressPercentage = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        // Get user friendly name
        const userName = profileData?.first_name || profileData?.username || 'User';
        
        // Update dashboard data
        setDashboardData({
          goals: { inProgress: goalsData.length },
          tasks: { completed: completedTasks, total: totalTasks },
          progress: progressPercentage,
          achievements: achievementsData.length,
          userName,
          todaysTasks: todaysTasks || []
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);
  
  // Toggle task completion status
  const toggleTaskCompletion = async (taskId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !currentStatus, updated_at: new Date() })
        .eq('id', taskId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Update local state
      setDashboardData(prev => ({
        ...prev,
        todaysTasks: prev.todaysTasks.map(task => 
          task.id === taskId ? { ...task, completed: !currentStatus } : task
        )
      }));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const quickStats = [
    { 
      title: 'Goals in Progress', 
      value: dashboardData.goals.inProgress.toString(), 
      icon: <Target size={20} />, 
      color: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' 
    },
    { 
      title: 'Tasks Completed', 
      value: `${dashboardData.tasks.completed}/${dashboardData.tasks.total}`, 
      icon: <CheckSquare size={20} />, 
      color: 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400' 
    },
    { 
      title: 'Progress', 
      value: `${dashboardData.progress}%`, 
      icon: <TrendingUp size={20} />, 
      color: 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400' 
    },
    { 
      title: 'Achievements', 
      value: dashboardData.achievements.toString(), 
      icon: <Award size={20} />, 
      color: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400' 
    },
  ];

  if (loading) {
    return (
      <section className="pt-6 pb-12 md:pt-8 md:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading your dashboard...</p>
          </div>
        </div>
      </section>
    );
  }

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
          <h2 className="text-2xl font-bold mb-2">Welcome back, {dashboardData.userName}!</h2>
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

        {/* Today's Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 overflow-hidden p-6 md:p-8">
          <div className="flex items-center mb-6">
            <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full mr-4">
              <CheckSquare className="text-indigo-600 dark:text-indigo-400" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Today's Focus</h2>
          </div>
          <div className="space-y-4">
            {dashboardData.todaysTasks.length > 0 ? (
              dashboardData.todaysTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-center p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <input 
                    type="checkbox" 
                    checked={task.completed}
                    onChange={() => toggleTaskCompletion(task.id, task.completed)}
                    className="h-5 w-5 text-indigo-600 rounded border-gray-300 dark:border-gray-600 focus:ring-indigo-500"
                  />
                  <span className={`ml-3 ${task.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-200'}`}>
                    {task.title}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">No tasks scheduled for today.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardOverview;