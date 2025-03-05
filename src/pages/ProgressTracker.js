import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, ArrowRight,  Flag, Target, Loader, Plus, Edit, CheckCircle, Clock} from 'lucide-react';
import supabase from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const ProgressTracker = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState([]);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [streaks, setStreaks] = useState({
    currentStreak: 0,
    longestStreak: 0,
    lastUpdated: null
  });
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    completed: false,
    goalId: ''
  });

  // Calculate overall progress from goals
  const calculateOverallProgress = () => {
    if (goals.length === 0) return 0;
    
    let totalProgress = 0;
    goals.forEach(goal => {
      totalProgress += goal.progress;
    });
    
    return Math.round(totalProgress / goals.length);
  };

  // Calculate task completion percentage
  const calculateTaskPercentage = () => {
    if (totalTasks === 0) return 0;
    return Math.round((completedTasks / totalTasks) * 100);
  };

  // Fetch user data from database
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch user's goals
        const { data: goalsData, error: goalsError } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (goalsError) throw goalsError;
        
        setGoals(goalsData || []);
        
        // Fetch user's tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id);
        
        if (tasksError) throw tasksError;
        
        setTotalTasks(tasksData?.length || 0);
        setCompletedTasks(tasksData?.filter(task => task.completed)?.length || 0);
        
        // Create milestones from goals and tasks
        const milestonesList = [];
        
        // Add completed goals as milestones
        goalsData?.forEach(goal => {
          if (goal.completed) {
            milestonesList.push({
              id: `goal-${goal.id}`,
              title: goal.title,
              completed: true,
              date: goal.updated_at,
              type: 'goal'
            });
          }
          
          // Add upcoming goals with deadlines
          if (!goal.completed && goal.deadline) {
            milestonesList.push({
              id: `goal-${goal.id}`,
              title: goal.title,
              completed: false,
              date: goal.deadline,
              type: 'goal'
            });
          }
        });
        
        // Add completed tasks as milestones (if they have due dates)
        tasksData?.forEach(task => {
          if (task.completed && task.due_date) {
            milestonesList.push({
              id: `task-${task.id}`,
              title: task.title,
              completed: true,
              date: task.due_date,
              type: 'task'
            });
          }
        });
        
        // Sort milestones by date
        milestonesList.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        setMilestones(milestonesList);
        
        // Fetch user streaks
        const { data: streaksData, error: streaksError } = await supabase
          .from('user_streaks')
          .select('*')
          .eq('user_id', user.id)
          .eq('streak_type', 'daily_login')
          .single();
        
        if (!streaksError && streaksData) {
          setStreaks({
            currentStreak: streaksData.current_count,
            longestStreak: streaksData.longest_count,
            lastUpdated: streaksData.last_updated_at
          });
        }
        
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const openModal = (milestone = null) => {
    if (milestone) {
      // Format the date for the form input (YYYY-MM-DD format)
      const dateFormatted = milestone.date ? new Date(milestone.date).toISOString().split('T')[0] : '';
      
      setFormData({
        title: milestone.title || '',
        date: dateFormatted,
        completed: milestone.completed || false,
        goalId: milestone.id.startsWith('goal-') ? milestone.id.replace('goal-', '') : ''
      });
      setCurrentMilestone(milestone);
    } else {
      // Reset form for new milestone
      setFormData({
        title: '',
        date: '',
        completed: false,
        goalId: ''
      });
      setCurrentMilestone(null);
    }
    setIsModalOpen(true);
    setFormError('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setFormError('Please enter a title for your milestone');
      return;
    }
    
    if (!formData.date) {
      setFormError('Please select a date for your milestone');
      return;
    }

    try {
      // For now, milestones are represented as goals with special tags
      if (currentMilestone) {
        // Update existing goal that serves as a milestone
        if (currentMilestone.id.startsWith('goal-')) {
          const goalId = currentMilestone.id.replace('goal-', '');
          const { error } = await supabase
            .from('goals')
            .update({
              title: formData.title,
              deadline: formData.date ? new Date(formData.date).toISOString() : null,
              completed: formData.completed,
              updated_at: new Date().toISOString()
            })
            .eq('id', goalId);

          if (error) throw error;
        }
      } else {
        // Create new goal as a milestone - remove the category field
        const { error } = await supabase
          .from('goals')
          .insert([{
            user_id: user.id,
            title: formData.title,
            description: 'Milestone',
            progress: formData.completed ? 100 : 0,
            deadline: formData.date ? new Date(formData.date).toISOString() : null,
            completed: formData.completed
          }])
          .select();

        if (error) throw error;
      }
      
      // Refresh data
      window.location.reload();
      closeModal();
    } catch (error) {
      console.error('Error saving milestone:', error);
      setFormError(error.message || 'An error occurred while saving your milestone');
    }
  };

  const progressPercentage = calculateOverallProgress();
  const tasksPercentage = calculateTaskPercentage();

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

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="h-8 w-8 text-indigo-500 animate-spin" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading your progress data...</span>
          </div>
        ) : (
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
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Goal Progress</h3>
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
                          {progressPercentage}%
                        </span>
                        <span className="ml-2 text-indigo-600 dark:text-indigo-400 font-medium">Complete</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Tasks Completion</h3>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-5 mb-6">
                      <div 
                        className="bg-green-600 dark:bg-green-500 h-5 rounded-full transition-all duration-700 ease-in-out relative"
                        style={{ width: `${tasksPercentage}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 rounded-full bg-opacity-30 bg-gradient-to-r from-transparent to-white/20"></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center">
                      <div className="text-center px-6 py-3 bg-green-50 dark:bg-green-900/30 rounded-full">
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {completedTasks}/{totalTasks}
                        </span>
                        <span className="ml-2 text-green-600 dark:text-green-400 font-medium">Tasks</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 text-center">
                      <div className="text-indigo-600 dark:text-indigo-400 font-semibold mb-1">Active Goals</div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {goals.filter(g => !g.completed).length}
                      </div>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
                      <div className="text-green-600 dark:text-green-400 font-semibold mb-1">Completed Goals</div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {goals.filter(g => g.completed).length}
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
                      <div className="text-blue-600 dark:text-blue-400 font-semibold mb-1">Day Streak</div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {streaks.currentStreak} <span className="text-sm font-normal">days</span>
                      </div>
                    </div>
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
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Milestone Timeline</h2>
                  <button 
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-md"
                  >
                    <Plus size={16} /> Add Milestone
                  </button>
                </div>
                
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                  
                  {milestones.length === 0 ? (
                    <div className="py-8 flex justify-center items-center">
                      <div className="text-center max-w-md">
                        <Flag className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No Milestones Yet
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                          Track your progress by creating milestones, or complete goals and tasks to automatically generate them.
                        </p>
                        <button 
                          onClick={() => openModal()}
                          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors shadow-md"
                        >
                          <Plus size={14} /> Create First Milestone
                        </button>
                      </div>
                    </div>
                  ) : (
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

                            <div className="mt-2 flex items-center gap-3">
                              {milestone.completed ? (
                                <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                                  <CheckCircle size={14} className="mr-1" /> Completed
                                </span>
                              ) : (
                                <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                                  <Clock size={14} className="mr-1" /> Upcoming
                                </span>
                              )}
                              
                              <span className={`px-3 py-1 rounded-full text-sm font-medium
                                ${milestone.type === 'goal' 
                                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                                  : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                }`}>
                                {milestone.type === 'goal' ? 'Goal' : 'Task'}
                              </span>
                              
                              {milestone.id.startsWith('goal-') && (
                                <button 
                                  onClick={() => openModal(milestone)}
                                  className="p-1 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                                >
                                  <Edit size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {milestones.length > 0 && (
                  <div className="mt-10 flex justify-center">
                    <a href="/mygoals" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white px-6 py-3 rounded-full text-lg font-medium transition-colors shadow-md">
                      View All Goals
                      <ArrowRight size={18} />
                    </a>
                  </div>
                )}
              </div>
            </div>
            
            {/* Progress Stats Cards */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-900/30 overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full mr-3">
                    <CheckCircle className="text-green-600 dark:text-green-400" size={18} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Completion Rate</h2>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {completedTasks} of {totalTasks} tasks completed
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-900/30 overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full mr-3">
                    <Clock className="text-blue-600 dark:text-blue-400" size={18} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Current Streak</h2>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {streaks.currentStreak} days
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Best: {streaks.longestStreak} days
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-900/30 overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-full mr-3">
                    <Target className="text-purple-600 dark:text-purple-400" size={18} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Goal Status</h2>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {goals.filter(g => g.completed).length}/{goals.length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {goals.filter(g => !g.completed).length} active goals remaining
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Milestone Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full p-6 relative">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {currentMilestone ? 'Edit Milestone' : 'Create New Milestone'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              {formError && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4">
                  {formError}
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-1" htmlFor="title">
                  Milestone Title*
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="E.g., Launch MVP Version"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-1" htmlFor="date">
                  Date*
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div className="mb-6">
                <label className="flex items-center text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    name="completed"
                    checked={formData.completed}
                    onChange={handleInputChange}
                    className="mr-2 h-5 w-5"
                  />
                  Mark as completed
                </label>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors"
                >
                  {currentMilestone ? 'Save Changes' : 'Create Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProgressTracker;