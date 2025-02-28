import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DashboardOverview from './DashboardOverview';
import MyGoals from './MyGoals';
import TaskList from './TaskList';
import ProgressTracker from './ProgressTracker';
import Achievements from './Achievements';
import Community from './Community';
import Settings from './Settings';

function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  
  // Extract current page from URL path
  const currentPath = location.pathname.split('/dashboard/')[1] || '';
  const currentPage = currentPath === '' ? 'dashboard' : currentPath;

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-white transition-colors duration-300">
      <Sidebar 
        currentPage={currentPage}
        isCollapsed={sidebarCollapsed}
        toggleSidebar={toggleSidebar}
      />
      <main 
        className={`transition-all duration-300 min-h-screen ${
          sidebarCollapsed ? 'ml-16' : 'ml-0 md:ml-64'
        }`}
      >
        <div className="pt-6 pb-12 md:pt-8 md:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-6 md:p-8">
                <Routes>
                  <Route index element={<DashboardOverview />} />
                  <Route path="goals" element={<MyGoals />} />
                  <Route path="tasks" element={<TaskList />} />
                  <Route path="progress" element={<ProgressTracker />} />
                  <Route path="achievements" element={<Achievements />} />
                  <Route path="community" element={<Community />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;