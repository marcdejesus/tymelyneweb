import React from 'react';
import { 
  Home, 
  Target, 
  CheckSquare, 
  TrendingUp, 
  Award, 
  Users, 
  Settings, 
  Menu, 
  ChevronLeft,
  LogOut 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ currentPage, isCollapsed, toggleSidebar }) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleNavigation = (page) => {
    navigate(`/dashboard/${page === 'dashboard' ? '' : page}`);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home size={20} /> },
    { id: 'goals', label: 'My Goals', icon: <Target size={20} /> },
    { id: 'tasks', label: 'Task List', icon: <CheckSquare size={20} /> },
    { id: 'progress', label: 'Progress Tracker', icon: <TrendingUp size={20} /> },
    { id: 'achievements', label: 'Achievements', icon: <Award size={20} /> },
    { id: 'community', label: 'Community', icon: <Users size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  // Get user's initials for avatar
  const getUserInitials = () => {
    if (!user) return 'G';
    
    // If profile has first_name and last_name
    if (user.profile?.first_name && user.profile?.last_name) {
      return `${user.profile.first_name.charAt(0)}${user.profile.last_name.charAt(0)}`;
    }
    
    // If username exists
    if (user.profile?.username) {
      return user.profile.username.charAt(0).toUpperCase();
    }
    
    // Fallback to email
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-900/30 transition-all duration-300 ease-in-out 
        ${isCollapsed ? 'w-16' : 'w-64'}`}
    >
      {/* Logo and menu toggle */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        {!isCollapsed && (
          <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">TymeLyne</div>
        )}
        <button 
          onClick={toggleSidebar}
          className="p-1 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors"
        >
          {isCollapsed ? <Menu size={24} /> : <ChevronLeft size={24} />}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleNavigation(item.id)}
                className={`flex items-center w-full p-3 ${
                  isCollapsed ? 'justify-center' : 'pl-4'
                } ${
                  currentPage === item.id
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-r-4 border-indigo-600 dark:border-indigo-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400'
                } transition-colors duration-200 rounded-l-md`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!isCollapsed && <span className="ml-3 font-medium">{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t dark:border-gray-700">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold">
            {getUserInitials()}
          </div>
          {!isCollapsed && (
            <div className="ml-3 flex-1">
              <p className="font-medium text-sm text-gray-800 dark:text-gray-200">
                {user?.profile?.username || user?.profile?.first_name || 'Guest'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.profile?.level ? `Level ${user.profile.level}` : 'Welcome!'}
              </p>
            </div>
          )}
          
          {/* Sign out button */}
          {!isCollapsed && (
            <button 
              onClick={handleSignOut}
              className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;