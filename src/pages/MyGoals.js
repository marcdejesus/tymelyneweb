import React, { useState, useEffect } from 'react';
import { Target, Plus, Edit, Trash2, Calendar, Loader, CheckCircle} from 'lucide-react';
import supabase from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const MyGoals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentGoal, setCurrentGoal] = useState(null);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    progress: 0,
    deadline: '',
    completed: false
  });

  // Fetch goals from database
  useEffect(() => {
    const fetchGoals = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setGoals(data || []);
      } catch (error) {
        console.error('Error fetching goals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const openModal = (goal = null) => {
    if (goal) {
      // Format the date for the form input (YYYY-MM-DD format)
      const deadlineDate = goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '';
      
      setFormData({
        title: goal.title || '',
        description: goal.description || '',
        progress: goal.progress || 0,
        deadline: deadlineDate,
        completed: goal.completed || false
      });
      setCurrentGoal(goal);
    } else {
      // Reset form for new goal
      setFormData({
        title: '',
        description: '',
        progress: 0,
        deadline: '',
        completed: false
      });
      setCurrentGoal(null);
    }
    setIsModalOpen(true);
    setFormError('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormError('');
  };

  const openDeleteModal = (goal) => {
    setCurrentGoal(goal);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setFormError('Please enter a title for your goal');
      return;
    }

    try {
      if (currentGoal) {
        // Update existing goal
        const { error } = await supabase
          .from('goals')
          .update({
            title: formData.title,
            description: formData.description,
            progress: parseInt(formData.progress),
            deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
            completed: formData.completed,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentGoal.id);

        if (error) throw error;
        
        setGoals(goals.map(goal => 
          goal.id === currentGoal.id ? 
          {...goal, 
            title: formData.title,
            description: formData.description,
            progress: parseInt(formData.progress),
            deadline: formData.deadline,
            completed: formData.completed,
            updated_at: new Date().toISOString()
          } : goal
        ));
      } else {
        // Create new goal
        const { data, error } = await supabase
          .from('goals')
          .insert([{
            user_id: user.id,
            title: formData.title,
            description: formData.description,
            progress: parseInt(formData.progress),
            deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
            completed: formData.completed
          }])
          .select();

        if (error) throw error;
        
        if (data) {
          setGoals([data[0], ...goals]);
        }
      }
      
      closeModal();
    } catch (error) {
      console.error('Error saving goal:', error);
      setFormError(error.message || 'An error occurred while saving your goal');
    }
  };

  const handleDelete = async () => {
    if (!currentGoal) return;
    
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', currentGoal.id);

      if (error) throw error;
      
      setGoals(goals.filter(goal => goal.id !== currentGoal.id));
      closeDeleteModal();
    } catch (error) {
      console.error('Error deleting goal:', error);
      setFormError(error.message || 'An error occurred while deleting your goal');
    }
  };

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
          <div></div>
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white px-5 py-3 rounded-full text-lg font-medium transition-colors shadow-md"
          >
            <Plus size={18} /> Add New Goal
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="h-8 w-8 text-indigo-500 animate-spin" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading goals...</span>
          </div>
        ) : goals.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
            <Target className="h-12 w-12 mx-auto text-indigo-500 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No Goals Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start by creating your first goal to track your progress.
            </p>
            <button 
              onClick={() => openModal()}
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white px-5 py-3 rounded-full text-lg font-medium transition-colors shadow-md"
            >
              <Plus size={18} /> Create Your First Goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {goals.map(goal => (
              <div 
                key={goal.id} 
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-900/30 border ${
                  goal.completed 
                    ? 'border-green-200 dark:border-green-900/30' 
                    : 'border-gray-100 dark:border-gray-700'
                } p-6 md:p-8 hover:shadow-lg transition-shadow`}
              >
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <div className={`${
                      goal.completed 
                        ? 'bg-green-100 dark:bg-green-900/50' 
                        : 'bg-indigo-100 dark:bg-indigo-900/50'
                      } p-3 rounded-full mr-4`}>
                      {goal.completed 
                        ? <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
                        : <Target className="text-indigo-600 dark:text-indigo-400" size={20} />
                      }
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold ${
                        goal.completed 
                          ? 'text-gray-700 dark:text-gray-300'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {goal.title}
                      </h3>
                      {goal.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {goal.description.length > 80 
                            ? goal.description.substring(0, 80) + '...' 
                            : goal.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => openModal(goal)}
                      className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => openDeleteModal(goal)}
                      className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
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
                      className={`${
                        goal.completed
                          ? 'bg-green-600 dark:bg-green-500'
                          : 'bg-indigo-600 dark:bg-indigo-500'
                      } h-3 rounded-full transition-all duration-700 ease-in-out relative`}
                      style={{ width: `${goal.completed ? 100 : goal.progress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 rounded-full bg-opacity-30 bg-gradient-to-r from-transparent to-white/20"></div>
                    </div>
                  </div>
                </div>
                
                {goal.deadline && (
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
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full p-6 relative">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {currentGoal ? 'Edit Goal' : 'Create New Goal'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              {formError && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4">
                  {formError}
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-1" htmlFor="title">
                  Goal Title*
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="E.g., Learn React & Tailwind"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-1" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Add details about your goal..."
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-1" htmlFor="progress">
                  Progress: {formData.progress}%
                </label>
                <input
                  type="range"
                  id="progress"
                  name="progress"
                  value={formData.progress}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="5"
                  className="w-full"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-1" htmlFor="deadline">
                  Deadline
                </label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={formData.deadline}
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
                  {currentGoal ? 'Save Changes' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 relative">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Delete Goal</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete "{currentGoal?.title}"? This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                className="px-5 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1"
              >
                <Trash2 size={16} /> Delete Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default MyGoals;