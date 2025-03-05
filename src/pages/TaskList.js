import React, { useState, useEffect } from 'react';
import { Calendar, CheckSquare, Plus, Edit, Trash2, Loader } from 'lucide-react';
import supabase from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const TaskList = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [formError, setFormError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'today', 'upcoming', 'completed'
  const [goalsList, setGoalsList] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    category: '',
    goal_id: '',
    completed: false
  });

  // Fetch tasks from database
  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Apply filters if needed
        let query = supabase
          .from('tasks')
          .select('*, goals(title)')
          .eq('user_id', user.id)
          .order('due_date', { ascending: true });
        
        if (filter === 'today') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          query = query
            .gte('due_date', today.toISOString())
            .lt('due_date', tomorrow.toISOString());
        } else if (filter === 'upcoming') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          query = query
            .gte('due_date', today.toISOString());
        } else if (filter === 'completed') {
          query = query.eq('completed', true);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        setTasks(data || []);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch goals for the dropdown
    const fetchGoals = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('goals')
          .select('id, title')
          .eq('user_id', user.id)
          .eq('completed', false)
          .order('title');
        
        if (error) throw error;
        
        setGoalsList(data || []);
      } catch (error) {
        console.error('Error fetching goals:', error);
      }
    };

    fetchTasks();
    fetchGoals();
  }, [user, filter]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const openModal = (task = null) => {
    if (task) {
      // Format the date for the form input (YYYY-MM-DD format)
      const dueDateFormatted = task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '';
      
      setFormData({
        title: task.title || '',
        description: task.description || '',
        due_date: dueDateFormatted,
        category: task.category || '',
        goal_id: task.goal_id || '',
        completed: task.completed || false
      });
      setCurrentTask(task);
    } else {
      // Reset form for new task
      setFormData({
        title: '',
        description: '',
        due_date: '',
        category: '',
        goal_id: '',
        completed: false
      });
      setCurrentTask(null);
    }
    setIsModalOpen(true);
    setFormError('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormError('');
  };

  const openDeleteModal = (task) => {
    setCurrentTask(task);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setFormError('Please enter a title for your task');
      return;
    }

    try {
      if (currentTask) {
        // Update existing task
        const { error } = await supabase
          .from('tasks')
          .update({
            title: formData.title,
            description: formData.description,
            due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
            category: formData.category,
            goal_id: formData.goal_id || null,
            completed: formData.completed,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentTask.id);

        if (error) throw error;
        
        // Update local state
        setTasks(tasks.map(task => 
          task.id === currentTask.id ? 
          {
            ...task, 
            title: formData.title,
            description: formData.description,
            due_date: formData.due_date,
            category: formData.category,
            goal_id: formData.goal_id,
            completed: formData.completed,
            updated_at: new Date().toISOString()
          } : task
        ));
      } else {
        // Create new task
        const { data, error } = await supabase
          .from('tasks')
          .insert([{
            user_id: user.id,
            title: formData.title,
            description: formData.description,
            due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
            category: formData.category,
            goal_id: formData.goal_id || null,
            completed: formData.completed
          }])
          .select();

        if (error) throw error;
        
        if (data) {
          // Fetch the goal title if there is a goal_id
          if (data[0].goal_id) {
            const goal = goalsList.find(g => g.id === data[0].goal_id);
            data[0].goals = { title: goal ? goal.title : '' };
          }
          
          setTasks([data[0], ...tasks]);
        }
      }
      
      closeModal();
    } catch (error) {
      console.error('Error saving task:', error);
      setFormError(error.message || 'An error occurred while saving your task');
    }
  };

  const handleDelete = async () => {
    if (!currentTask) return;
    
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', currentTask.id);

      if (error) throw error;
      
      setTasks(tasks.filter(task => task.id !== currentTask.id));
      closeDeleteModal();
    } catch (error) {
      console.error('Error deleting task:', error);
      setFormError(error.message || 'An error occurred while deleting your task');
    }
  };

  const toggleTaskCompletion = async (taskId, isCompleted) => {
    try {
      // Optimistic update
      setTasks(tasks.map(task => 
        task.id === taskId ? {...task, completed: !isCompleted} : task
      ));
      
      // Update in database
      const { error } = await supabase
        .from('tasks')
        .update({
          completed: !isCompleted,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating task completion:', error);
      // Revert the optimistic update if the server update fails
      setTasks(tasks.map(task => 
        task.id === taskId ? {...task, completed: isCompleted} : task
      ));
    }
  };

  const filterButtons = [
    { id: 'all', label: 'All Tasks' },
    { id: 'today', label: 'Today' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'completed', label: 'Completed' }
  ];

  // Helper to format date with specific display logic
  const formatDueDate = (dateString) => {
    if (!dateString) return 'No due date';
    
    const dueDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (dueDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (dueDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return dueDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  // Get category options from tasks
  const getCategories = () => {
    const categories = new Set();
    tasks.forEach(task => {
      if (task.category) categories.add(task.category);
    });
    return ['Personal', 'Work', 'Learning', 'Health', 'Finance', 'Social', ...Array.from(categories)];
  };

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

        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {filterButtons.map(btn => (
              <button 
                key={btn.id}
                onClick={() => setFilter(btn.id)}
                className={`flex items-center gap-1 px-4 py-2 border rounded-full text-sm font-medium transition-colors ${
                  filter === btn.id
                    ? 'bg-indigo-500 text-white border-indigo-500 dark:bg-indigo-600 dark:border-indigo-600'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {btn.id === 'all' && <CheckSquare size={16} />}
                {btn.id === 'today' && <Calendar size={16} />}
                {btn.id === 'upcoming' && <Calendar size={16} />}
                {btn.id === 'completed' && <CheckSquare size={16} />}
                <span>{btn.label}</span>
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white px-5 py-3 rounded-full text-sm font-medium transition-colors shadow-md"
          >
            <Plus size={16} /> Add New Task
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="h-8 w-8 text-indigo-500 animate-spin" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading tasks...</span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center border border-gray-100 dark:border-gray-700">
            <CheckSquare className="h-12 w-12 mx-auto text-indigo-500 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No Tasks Found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {filter === 'all' 
                ? "You don't have any tasks yet. Start by creating one!" 
                : `No ${filter} tasks found.`}
            </p>
            <button 
              onClick={() => openModal()}
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white px-5 py-3 rounded-full text-lg font-medium transition-colors shadow-md"
            >
              <Plus size={18} /> Create Your First Task
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-900/30 overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="p-6 md:p-8">
              <div className="flex items-center mb-6">
                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full mr-4">
                  <CheckSquare className="text-indigo-600 dark:text-indigo-400" size={20} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {filter === 'all' && 'All Tasks'}
                  {filter === 'today' && 'Tasks for Today'}
                  {filter === 'upcoming' && 'Upcoming Tasks'}
                  {filter === 'completed' && 'Completed Tasks'}
                </h2>
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
                        checked={task.completed || false}
                        onChange={() => toggleTaskCompletion(task.id, task.completed)}
                        className="h-4 w-4 text-indigo-600 dark:text-indigo-400 rounded border-gray-300 dark:border-gray-600 focus:ring-indigo-500 dark:focus:ring-indigo-400 z-10 opacity-0 absolute inset-0 cursor-pointer"
                        aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
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
                      
                      <div className="flex items-center mt-1 space-x-4">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Calendar size={12} className="mr-1" />
                          <span>{formatDueDate(task.due_date)}</span>
                        </div>
                        
                        {task.goal_id && task.goals && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md">
                              Goal: {task.goals.title}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 text-xs rounded-full ${
                        task.completed
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                          : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                      }`}>
                        {task.category || 'Uncategorized'}
                      </span>
                      
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                        <button 
                          onClick={() => openModal(task)}
                          className="p-1 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                          aria-label="Edit task"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(task)}
                          className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                          aria-label="Delete task"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filter !== 'all' && (
                <div className="mt-8 flex justify-center">
                  <button 
                    onClick={() => setFilter('all')}
                    className="flex items-center gap-2 border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-6 py-2 rounded-full text-sm font-medium transition-colors"
                  >
                    View All Tasks
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full p-6 relative">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {currentTask ? 'Edit Task' : 'Create New Task'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              {formError && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4">
                  {formError}
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-1" htmlFor="title">
                  Task Title*
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="What needs to be done?"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-1" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Add details about your task..."
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1" htmlFor="due_date">
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="due_date"
                    name="due_date"
                    value={formData.due_date || ''}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1" htmlFor="category">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category || ''}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select a category</option>
                    {getCategories().map((category, index) => (
                      <option key={index} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-300 mb-1" htmlFor="goal_id">
                  Related Goal
                </label>
                <select
                  id="goal_id"
                  name="goal_id"
                  value={formData.goal_id || ''}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Not related to a goal</option>
                  {goalsList.map(goal => (
                    <option key={goal.id} value={goal.id}>
                      {goal.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-6">
                <label className="flex items-center text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    name="completed"
                    checked={formData.completed || false}
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
                  {currentTask ? 'Save Changes' : 'Create Task'}
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Delete Task</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete "{currentTask?.title}"? This action cannot be undone.
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
                <Trash2 size={16} /> Delete Task
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default TaskList;
