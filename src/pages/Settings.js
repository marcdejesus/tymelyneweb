import React, { useState, useEffect } from 'react';
import { Bell, User, Lock, Moon, Sun, ToggleLeft, ToggleRight, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import supabase from '../lib/supabaseClient';

const Settings = () => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  
  // User profile data
  const [userProfile, setUserProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    timezone: 'America/Los_Angeles',
    language: 'en',
  });

  // Notification preferences
  const [notificationPreferences, setNotificationPreferences] = useState({
    email_notifications: true,
    push_notifications: true,
    weekly_reports: true,
  });
  
  // Password change fields
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch user profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError) throw profileError;
        
        // Fetch user preferences
        const { data: preferencesData, error: preferencesError } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (preferencesError && preferencesError.code !== 'PGRST116') {
          throw preferencesError;
        }
        
        // Update state with fetched data
        if (profileData) {
          setUserProfile({
            first_name: profileData.first_name || '',
            last_name: profileData.last_name || '',
            email: profileData.email || user.email || '',
            timezone: profileData.timezone || 'America/Los_Angeles',
            language: profileData.language || 'en',
          });
        }
        
        if (preferencesData) {
          setNotificationPreferences({
            email_notifications: preferencesData.email_notifications ?? true,
            push_notifications: preferencesData.push_notifications ?? true,
            weekly_reports: preferencesData.weekly_reports ?? true,
          });
          
          // Set dark mode based on user preference
          setDarkMode(preferencesData.dark_mode || false);
          if (preferencesData.dark_mode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        showNotification('Failed to load user settings', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);
  
  // Handle profile updates
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setSaving(true);
      
      // Update user profile in database
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: userProfile.first_name,
          last_name: userProfile.last_name,
          timezone: userProfile.timezone,
          language: userProfile.language,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (profileError) throw profileError;
      
      showNotification('Profile updated successfully', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  // Handle dark mode toggle
  const handleToggleDarkMode = async () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    // Apply dark mode to document
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Update preference in database
    try {
      const { error } = await supabase
        .from('user_preferences')
        .update({ dark_mode: newDarkMode })
        .eq('user_id', user.id);
      
      if (error) {
        // If no row exists, insert a new one
        if (error.code === 'PGRST116') {
          await supabase
            .from('user_preferences')
            .insert({
              user_id: user.id,
              dark_mode: newDarkMode,
              email_notifications: notificationPreferences.email_notifications,
              push_notifications: notificationPreferences.push_notifications,
              weekly_reports: notificationPreferences.weekly_reports
            });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error updating dark mode preference:', error);
      // Rollback UI if the database update fails
      setDarkMode(!newDarkMode);
      document.documentElement.classList.toggle('dark');
    }
  };
  
  // Handle notification preference changes
  const handleNotificationChange = async (key) => {
    const updatedPreferences = {
      ...notificationPreferences,
      [key]: !notificationPreferences[key]
    };
    
    // Update UI immediately for responsiveness
    setNotificationPreferences(updatedPreferences);
    
    // Update preferences in database
    try {
      const { error } = await supabase
        .from('user_preferences')
        .update({ [key]: updatedPreferences[key] })
        .eq('user_id', user.id);
      
      if (error) {
        // If no row exists, insert a new one
        if (error.code === 'PGRST116') {
          await supabase
            .from('user_preferences')
            .insert({
              user_id: user.id,
              dark_mode: darkMode,
              ...updatedPreferences
            });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error(`Error updating ${key} preference:`, error);
      // Rollback UI state if database update fails
      setNotificationPreferences({
        ...notificationPreferences,
        [key]: !updatedPreferences[key]
      });
    }
  };
  
  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Validate password inputs
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification('New passwords do not match', 'error');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      showNotification('Password must be at least 6 characters', 'error');
      return;
    }
    
    try {
      setSaving(true);
      
      // Update password via Supabase Auth API
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });
      
      if (error) throw error;
      
      // Clear password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      showNotification('Password changed successfully', 'success');
    } catch (error) {
      console.error('Error changing password:', error);
      showNotification(error.message || 'Failed to change password', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  // Handle input changes
  const handleInputChange = (e, section = 'profile') => {
    const { name, value } = e.target;
    
    if (section === 'profile') {
      setUserProfile(prev => ({ ...prev, [name]: value }));
    } else if (section === 'password') {
      setPasswordData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Show notification helper
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    
    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // Handle tab display logic
  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return renderAccountTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'privacy':
        return renderPrivacyTab();
      case 'integrations':
        return renderIntegrationsTab();
      default:
        return renderAccountTab();
    }
  };
  
  // Account tab content 
  const renderAccountTab = () => (
    <>
      {/* Personal Information */}
      <div>
        <div className="flex items-center mb-6">
          <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full mr-4">
            <User className="text-indigo-600 dark:text-indigo-400" size={20} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Personal Information</h2>
        </div>
        
        <form onSubmit={handleProfileUpdate}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="first_name">
                First Name
              </label>
              <input 
                type="text"
                id="first_name"
                name="first_name"
                value={userProfile.first_name}
                onChange={(e) => handleInputChange(e)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="last_name">
                Last Name
              </label>
              <input 
                type="text" 
                id="last_name"
                name="last_name"
                value={userProfile.last_name}
                onChange={(e) => handleInputChange(e)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="email">
                Email
              </label>
              <input 
                type="email" 
                id="email"
                name="email"
                value={userProfile.email}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="timezone">
                Time Zone
              </label>
              <select 
                id="timezone"
                name="timezone"
                value={userProfile.timezone}
                onChange={(e) => handleInputChange(e)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="America/Los_Angeles">Pacific Time (UTC-8)</option>
                <option value="America/Denver">Mountain Time (UTC-7)</option>
                <option value="America/Chicago">Central Time (UTC-6)</option>
                <option value="America/New_York">Eastern Time (UTC-5)</option>
                <option value="UTC">UTC</option>
                <option value="Europe/London">London (UTC+0)</option>
                <option value="Europe/Paris">Paris (UTC+1)</option>
                <option value="Asia/Tokyo">Tokyo (UTC+9)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="language">
                Language
              </label>
              <select 
                id="language"
                name="language"
                value={userProfile.language}
                onChange={(e) => handleInputChange(e)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6">
            <button 
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-70 flex items-center"
            >
              {saving ? <><Loader size={16} className="animate-spin mr-2" /> Saving...</> : 'Save Changes'}
            </button>
          </div>
        </form>
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
            onClick={handleToggleDarkMode}
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
    </>
  );
  
  // Notifications tab content
  const renderNotificationsTab = () => (
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
            onClick={() => handleNotificationChange('email_notifications')}
            className={`p-1.5 rounded-full transition-colors ${
              notificationPreferences.email_notifications 
                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' 
                : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
            }`}
          >
            {notificationPreferences.email_notifications ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
          </button>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Push Notifications</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Receive push notifications on your device</p>
          </div>
          <button 
            onClick={() => handleNotificationChange('push_notifications')}
            className={`p-1.5 rounded-full transition-colors ${
              notificationPreferences.push_notifications 
                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' 
                : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
            }`}
          >
            {notificationPreferences.push_notifications ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
          </button>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Weekly Progress Report</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Receive a weekly summary of your progress</p>
          </div>
          <button 
            onClick={() => handleNotificationChange('weekly_reports')}
            className={`p-1.5 rounded-full transition-colors ${
              notificationPreferences.weekly_reports 
                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' 
                : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
            }`}
          >
            {notificationPreferences.weekly_reports ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
          </button>
        </div>
      </div>
    </div>
  );
  
  // Privacy tab content
  const renderPrivacyTab = () => (
    <div>
      <div className="flex items-center mb-6">
        <div className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-full mr-4">
          <Lock className="text-purple-600 dark:text-purple-400" size={20} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Privacy Settings</h2>
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Data & Privacy</h3>
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-5">
            <p className="font-medium text-gray-900 dark:text-white">Download Your Data</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 mb-4">
              Request a copy of all your data stored in our systems, including your goals, tasks, and activity.
            </p>
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
              Request Data Export
            </button>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-5">
            <p className="font-medium text-gray-900 dark:text-white">Delete Account</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 mb-4">
              This will permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Integrations tab content
  const renderIntegrationsTab = () => (
    <div>
      <div className="flex items-center mb-6">
        <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full mr-4">
          <svg className="text-blue-600 dark:text-blue-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Integrations</h2>
      </div>
      
      <div className="space-y-4">
        <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-lg bg-[#1DA1F2] flex items-center justify-center mr-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Twitter</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Share achievements automatically</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg transition-colors">
              Connect
            </button>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-lg bg-[#4267B2] flex items-center justify-center mr-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Facebook</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Share goals with friends</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg transition-colors">
              Connect
            </button>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-lg bg-[#E34F26] flex items-center justify-center mr-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm3 5.13h-1.67a.54.54 0 0 0-.53.5v3.75h2.14l-.24 2.73h-1.9v6.88h-3V14.1H7.7v-2.73h2.1V8.19a3.1 3.1 0 0 1 3.08-3.19h2.12z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Google Calendar</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sync tasks with your calendar</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg transition-colors">
              Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Security section - separated for better organization
  const renderSecuritySection = () => (
    <div>
      <div className="flex items-center mb-6">
        <div className="bg-red-100 dark:bg-red-900/50 p-3 rounded-full mr-4">
          <Lock className="text-red-600 dark:text-red-400" size={20} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Security</h2>
      </div>
      
      <form onSubmit={handlePasswordChange} className="max-w-md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="currentPassword">
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={(e) => handleInputChange(e, 'password')}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="newPassword">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={(e) => handleInputChange(e, 'password')}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="confirmPassword">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={(e) => handleInputChange(e, 'password')}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-70 flex items-center"
            >
              {saving ? <><Loader size={16} className="animate-spin mr-2" /> Updating...</> : 'Update Password'}
            </button>
          </div>
        </div>
      </form>
      
      <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Two-Factor Authentication (2FA)</h3>
        <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Protect your account with 2FA</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Add an extra layer of security by requiring a verification code in addition to your password.
              </p>
            </div>
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
              Set Up 2FA
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pt-6 pb-12 md:pt-8 md:pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-8">
          Settings
        </h1>
        
        {/* Notification display */}
        {notification && (
          <div className={`mb-6 p-4 rounded-lg flex items-start ${
            notification.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
              : 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300'
          }`}>
            {notification.type === 'success' 
              ? <CheckCircle className="mr-3 mt-0.5" size={18} /> 
              : <AlertCircle className="mr-3 mt-0.5" size={18} />
            }
            <span>{notification.message}</span>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="h-8 w-8 text-indigo-500 animate-spin" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading settings...</span>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar navigation */}
            <div className="w-full md:w-64 shrink-0">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <nav className="flex flex-col">
                  <button 
                    onClick={() => setActiveTab('account')}
                    className={`flex items-center px-5 py-4 text-left ${
                      activeTab === 'account' 
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-600 dark:border-indigo-400' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <User size={20} className={`${
                      activeTab === 'account' 
                        ? 'text-indigo-600 dark:text-indigo-400' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`} />
                    <span className={`ml-3 font-medium ${
                      activeTab === 'account' 
                        ? 'text-indigo-700 dark:text-indigo-300' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>Account</span>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('notifications')}
                    className={`flex items-center px-5 py-4 text-left ${
                      activeTab === 'notifications' 
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-600 dark:border-indigo-400' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <Bell size={20} className={`${
                      activeTab === 'notifications' 
                        ? 'text-indigo-600 dark:text-indigo-400' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`} />
                    <span className={`ml-3 font-medium ${
                      activeTab === 'notifications' 
                        ? 'text-indigo-700 dark:text-indigo-300' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>Notifications</span>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('privacy')}
                    className={`flex items-center px-5 py-4 text-left ${
                      activeTab === 'privacy' 
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-600 dark:border-indigo-400' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <Lock size={20} className={`${
                      activeTab === 'privacy' 
                        ? 'text-indigo-600 dark:text-indigo-400' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`} />
                    <span className={`ml-3 font-medium ${
                      activeTab === 'privacy' 
                        ? 'text-indigo-700 dark:text-indigo-300' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>Privacy</span>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('integrations')}
                    className={`flex items-center px-5 py-4 text-left ${
                      activeTab === 'integrations' 
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-600 dark:border-indigo-400' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className={`${
                        activeTab === 'integrations' 
                          ? 'text-indigo-600 dark:text-indigo-400' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                    </svg>
                    <span className={`ml-3 font-medium ${
                      activeTab === 'integrations' 
                        ? 'text-indigo-700 dark:text-indigo-300' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>Integrations</span>
                  </button>
                </nav>
                
                <div className="border-t border-gray-200 dark:border-gray-700 p-5">
                  <button 
                    onClick={signOut}
                    className="flex items-center text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    <span className="ml-3">Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Main content area */}
            <div className="flex-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8 space-y-12">
                {/* Active tab content */}
                {renderTabContent()}
                
                {/* Security section (always visible under current tab) */}
                <hr className="border-gray-200 dark:border-gray-700" />
                {renderSecuritySection()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;