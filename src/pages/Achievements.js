import React, { useState, useEffect } from 'react';
import { Award, Star, Zap, Trophy, Target, Loader } from 'lucide-react';
import supabase from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const Achievements = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userAchievements, setUserAchievements] = useState([]);
  const [availableAchievements, setAvailableAchievements] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [streaks, setStreaks] = useState({
    dailyLogin: 0,
    taskCompletion: 0,
    goalProgress: 0,
    weeklyReviews: 0,
    longestLogin: 0
  });

  // Fetch user data and achievements
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch user profile for XP and level
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError) throw profileError;
        setUserProfile(profileData);
        
        // Fetch achievements definitions
        const { data: achievementsData, error: achievementsError } = await supabase
          .from('achievements')
          .select('*');
        
        if (achievementsError) throw achievementsError;
        setAvailableAchievements(achievementsData || []);
        
        // Fetch user's earned achievements
        const { data: userAchievementsData, error: userAchievementsError } = await supabase
          .from('user_achievements')
          .select('*, achievement_id(id, title, description, icon, criteria)')
          .eq('user_id', user.id);
        
        if (userAchievementsError) throw userAchievementsError;
        setUserAchievements(userAchievementsData || []);
        
        // Fetch user streaks
        const { data: streaksData, error: streaksError } = await supabase
          .from('user_streaks')
          .select('*')
          .eq('user_id', user.id);
        
        if (streaksError) throw streaksError;
        
        // Process streaks data
        const streaksObj = {
          dailyLogin: 0,
          taskCompletion: 0,
          goalProgress: 0,
          weeklyReviews: 0,
          longestLogin: 0
        };
        
        streaksData?.forEach(streak => {
          if (streak.streak_type === 'daily_login') {
            streaksObj.dailyLogin = streak.current_count;
            streaksObj.longestLogin = streak.longest_count;
          } else if (streak.streak_type === 'task_completion') {
            streaksObj.taskCompletion = streak.current_count;
          } else if (streak.streak_type === 'goal_progress') {
            streaksObj.goalProgress = streak.current_count;
          } else if (streak.streak_type === 'weekly_review') {
            streaksObj.weeklyReviews = streak.current_count;
          }
        });
        
        setStreaks(streaksObj);
        
        // Check if user has new achievements to unlock
        await checkForNewAchievements();
        
      } catch (error) {
        console.error('Error fetching achievements data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);
  
  const checkForNewAchievements = async () => {
    if (!user) return;
    
    try {
      // 1. Check for first goal achievement
      const { data: goalsData } = await supabase
        .from('goals')
        .select('id')
        .eq('user_id', user.id);
      
      if (goalsData && goalsData.length > 0) {
        await tryUnlockAchievement('first_goal');
      }
      
      // 2. Check for completed goals achievements
      const { data: completedGoalsData } = await supabase
        .from('goals')
        .select('id')
        .eq('user_id', user.id)
        .eq('completed', true);
      
      if (completedGoalsData) {
        const completedCount = completedGoalsData.length;
        
        if (completedCount >= 1) await tryUnlockAchievement('complete_first_goal');
        if (completedCount >= 3) await tryUnlockAchievement('goal_master');
        if (completedCount >= 10) await tryUnlockAchievement('goal_expert');
      }
      
      // 3. Check for completed tasks achievements
      const { data: completedTasksData } = await supabase
        .from('tasks')
        .select('id')
        .eq('user_id', user.id)
        .eq('completed', true);
      
      if (completedTasksData) {
        const completedCount = completedTasksData.length;
        
        if (completedCount >= 10) await tryUnlockAchievement('task_starter');
        if (completedCount >= 50) await tryUnlockAchievement('task_champion');
        if (completedCount >= 100) await tryUnlockAchievement('task_master');
      }
      
      // 4. Check for streak achievements
      if (streaks.dailyLogin >= 7) await tryUnlockAchievement('week_streak');
      if (streaks.dailyLogin >= 30) await tryUnlockAchievement('month_streak');
      
    } catch (error) {
      console.error('Error checking for new achievements:', error);
    }
  };
  
  const tryUnlockAchievement = async (achievementCode) => {
    try {
      // Check if user already has this achievement
      const { data: existingAchievement } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', user.id)
        .eq('achievement_id', achievementCode);
      
      if (existingAchievement && existingAchievement.length > 0) {
        return; // Already unlocked
      }
      
      // Unlock the achievement
      const { error } = await supabase
        .from('user_achievements')
        .insert([{
          user_id: user.id,
          achievement_id: achievementCode,
          earned_at: new Date().toISOString()
        }]);
      
      if (error) throw error;
      
      // Update XP (would need a function or trigger in the database)
      // For simplicity, we're just updating the UI here
      // In production, this might be handled by a database trigger
    } catch (error) {
      console.error('Error unlocking achievement:', error);
    }
  };
  
  // For demo/placeholder purposes - in a real app these would come from the database
  const demoAchievements = [
    { id: 'first_goal', title: 'First Goal Set', description: 'Created your first goal', icon: 'Target', earned_at: '2025-01-10', completed: true },
    { id: 'week_streak', title: '7-Day Streak', description: 'Used TymeLyne for 7 consecutive days', icon: 'Zap', earned_at: '2025-01-16', completed: true },
    { id: 'goal_master', title: 'Goal Master', description: 'Completed 3 goals', icon: 'Trophy', earned_at: '2025-02-05', completed: true },
    { id: 'task_champion', title: 'Task Champion', description: 'Completed 50 tasks', icon: 'Star', earned_at: null, completed: false },
    { id: 'month_streak', title: '30-Day Streak', description: 'Used TymeLyne for a full month', icon: 'Award', earned_at: null, completed: false },
    { id: 'goal_expert', title: 'Goal Expert', description: 'Completed 10 goals', icon: 'Trophy', earned_at: null, completed: false },
    { id: 'task_master', title: 'Task Master', description: 'Completed 100 tasks', icon: 'Star', earned_at: null, completed: false },
    { id: 'complete_first_goal', title: 'First Completion', description: 'Completed your first goal', icon: 'CheckCircle', earned_at: '2025-01-20', completed: true },
  ];

  // Calculate user level and XP
  const calculateLevel = (xp) => {
    // Simple level calculation logic
    const baseXP = 1000; // XP needed for first level
    const levelFactor = 0.1; // Level difficulty increase
    
    if (xp < baseXP) return { level: 1, currentXP: xp, nextLevelXP: baseXP, remainingXP: baseXP - xp };
    
    let level = 1;
    let remainingXP = xp;
    let levelXP = baseXP;
    
    while (remainingXP >= levelXP) {
      remainingXP -= levelXP;
      level++;
      levelXP = Math.floor(baseXP * (1 + level * levelFactor));
    }
    
    return {
      level,
      currentXP: xp - remainingXP,
      nextLevelXP: levelXP,
      remainingXP: levelXP - remainingXP
    };
  };

  const getLevelTitle = (level) => {
    const titles = [
      "Beginner",
      "Goal Setter",
      "Task Manager",
      "Progress Tracker",
      "Achievement Hunter",
      "Milestone Maker",
      "Goal Explorer",
      "Productivity Pro",
      "Time Master",
      "Task Virtuoso",
      "Goal Champion",
      "Planning Expert",
      "Focus Master",
      "Strategy Guru",
      "Productivity Legend"
    ];
    
    return titles[Math.min(level - 1, titles.length - 1)];
  };
  
  const getIconComponent = (iconName, size = 20) => {
    switch (iconName) {
      case 'Trophy': return <Trophy size={size} />;
      case 'Star': return <Star size={size} />;
      case 'Zap': return <Zap size={size} />;
      case 'Award': return <Award size={size} />;
      case 'Target': return <Target size={size} />;
      default: return <Award size={size} />;
    }
  };

  // Use real data if available, otherwise use demo data
  const displayAchievements = userAchievements.length > 0 
    ? userAchievements.map(ua => ({
        id: ua.achievement_id.id,
        title: ua.achievement_id.title,
        description: ua.achievement_id.description,
        icon: ua.achievement_id.icon,
        earned_at: ua.earned_at,
        completed: true
      }))
    : demoAchievements;

  // Calculate level data
  const xp = userProfile?.experience_points || 4250;
  const levelData = calculateLevel(xp);
  const levelTitle = getLevelTitle(levelData.level);
  const levelProgressPercent = Math.round((levelData.currentXP / levelData.nextLevelXP) * 100);

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
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="h-8 w-8 text-indigo-500 animate-spin" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading your achievements...</span>
          </div>
        ) : (
          <>
            {/* User Level Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 overflow-hidden p-6 md:p-8 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center">
                  <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full mr-4">
                    <Award className="text-indigo-600 dark:text-indigo-400" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Level {userProfile?.level || levelData.level}: {levelTitle}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {xp.toLocaleString()} XP
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Next Level: {levelData.nextLevelXP.toLocaleString()} XP ({levelData.remainingXP.toLocaleString()} XP remaining)
                  </p>
                  <div className="w-full md:w-40 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-indigo-600 dark:bg-indigo-500 h-3 rounded-full relative transition-all duration-700 ease-in-out"
                      style={{ width: `${levelProgressPercent}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 rounded-full bg-opacity-30 bg-gradient-to-r from-transparent to-white/20"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Achievements Grid */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 overflow-hidden p-6 md:p-8 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="bg-amber-100 dark:bg-amber-900/50 p-3 rounded-full mr-4">
                    <Trophy className="text-amber-600 dark:text-amber-400" size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Achievements</h2>
                </div>
                
                <div className="bg-indigo-50 dark:bg-indigo-900/20 px-4 py-1 rounded-full">
                  <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                    {displayAchievements.filter(a => a.completed).length}/{displayAchievements.length} Unlocked
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayAchievements.map(achievement => (
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
                        {getIconComponent(achievement.icon)}
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
                            ? `Earned on ${new Date(achievement.earned_at).toLocaleDateString('en-US', {
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
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{streaks.dailyLogin}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Daily Login</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl transition-transform duration-300 hover:-translate-y-1">
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{streaks.taskCompletion}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Task Completion</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl transition-transform duration-300 hover:-translate-y-1">
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{streaks.goalProgress}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Goal Progress</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-xl transition-transform duration-300 hover:-translate-y-1">
                  <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{streaks.weeklyReviews}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Weekly Reviews</p>
                </div>
              </div>
              
              {streaks.longestLogin > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
                  <div className="inline-block px-6 py-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
                    <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                      Longest Streak: <span className="font-bold">{streaks.longestLogin} days</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Achievements;
