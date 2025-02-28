import React, { useState } from 'react';
import { Bell, User, Lock, Moon, Sun, ToggleLeft, ToggleRight } from 'lucide-react';

const Settings = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [activeTab, setActiveTab] = useState('account');
  
  return (
    <section className="pt-6 pb-12 md:pt-8 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
            User <span className="text-indigo-600 dark:text-indigo-400">Settings</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl">
            Customize your account preferences and notification settings.
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 overflow-hidden">
          <nav className="flex border-b dark:border-gray-700 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('account')}
              className={`px-5 py-4 font-medium transition-colors ${
                activeTab === 'account' 
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              Account
            </button>
            <button 
              onClick={() => setActiveTab('notifications')}
              className={`px-5 py-4 font-medium transition-colors ${
                activeTab === 'notifications' 
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              Notifications
            </button>
            <button 
              onClick={() => setActiveTab('privacy')}
              className={`px-5 py-4 font-medium transition-colors ${
                activeTab === 'privacy' 
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              Privacy
            </button>
            <button 
              onClick={() => setActiveTab('integrations')}
              className={`px-5 py-4 font-medium transition-colors ${
                activeTab === 'integrations' 
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              Integrations
            </button>
          </nav>
          
          <div className="p-6 md:p-8 space-y-8">
            {/* Account Settings */}
            <div>
              <div className="flex items-center mb-6">
                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full mr-4">
                  <User className="text-indigo-600 dark:text-indigo-400" size={20} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Personal Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    defaultValue="User Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    defaultValue="user@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time Zone</label>
                  <select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option>Pacific Time (UTC-8)</option>
                    <option>Mountain Time (UTC-7)</option>
                    <option>Central Time (UTC-6)</option>
                    <option>Eastern Time (UTC-5)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Language</label>
                  <select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>
              </div>
            </div>
            
            <hr className="border-gray-200 dark:border-gray-700" />
            
            {/* Appearance */}
            <div>
              <div className="flex items-center mb-6">
                <div className="bg-amber-100 dark:bg-amber-900/50 p-3 rounded-full mr-4">
                  {darkMode ? 
                    <Moon className="text-amber-600 dark:text-amber-400" size={20} /> : 
                    <Sun className="text-amber-600 dark:text-amber-400" size={20} />
                  }
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Appearance</h2>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-5 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Switch between light and dark themes</p>
                </div>
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className={`p-1.5 rounded-full transition-colors ${
                    darkMode 
                      ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' 
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {darkMode ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                </button>
              </div>
            </div>
            
            <hr className="border-gray-200 dark:border-gray-700" />
            
            {/* Notifications */}
            <div>
              <div className="flex items-center mb-6">
                <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full mr-4">
                  <Bell className="text-green-600 dark:text-green-400" size={20} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notification Preferences</h2>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Receive updates via email</p>
                  </div>
                  <button 
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className={`p-1.5 rounded-full transition-colors ${
                      emailNotifications 
                        ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' 
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {emailNotifications ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                  </button>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Push Notifications</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Receive push notifications on your device</p>
                  </div>
                  <button 
                    onClick={() => setPushNotifications(!pushNotifications)}
                    className={`p-1.5 rounded-full transition-colors ${
                      pushNotifications 
                        ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' 
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {pushNotifications ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                  </button>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Weekly Progress Report</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Receive a weekly summary of your progress</p>
                  </div>
                  <button 
                    onClick={() => setWeeklyReport(!weeklyReport)}
                    className={`p-1.5 rounded-full transition-colors ${
                      weeklyReport 
                        ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' 
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {weeklyReport ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                  </button>
                </div>
              </div>
            </div>
            
            <hr className="border-gray-200 dark:border-gray-700" />
            
            {/* Security */}
            <div>
              <div className="flex items-center mb-6">
                <div className="bg-red-100 dark:bg-red-900/50 p-3 rounded-full mr-4">
                  <Lock className="text-red-600 dark:text-red-400" size={20} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Security</h2>
              </div>
              
              <button className="bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white px-6 py-3 rounded-full text-base font-medium transition-colors shadow-md">
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Settings;