// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import supabase from '../lib/supabaseClient';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for active session on component mount
    const getSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (data?.session) {
          const { data: userData } = await supabase.auth.getUser();
          
          if (userData?.user) {
            // Get additional profile data
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userData.user.id)
              .single();
              
            setUser({ 
              ...userData.user,
              profile: profileData || {} 
            });
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        setUser({ 
          ...session.user,
          profile: profileData || {} 
        });
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      if (authListener?.subscription?.unsubscribe) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);  // Make sure this happens
      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      return { error };
    }
  };

  // Add user stats update functions
  const updateUserExperience = async (pointsToAdd) => {
    if (!user) return { data: null, error: 'User not authenticated' };
    
    try {
      const currentXP = user.profile.experience_points || 0;
      const newXP = currentXP + pointsToAdd;
      
      // Calculate level (simple formula: level up every 1000 XP)
      const currentLevel = user.profile.level || 1;
      const newLevel = Math.floor(newXP / 1000) + 1;
      
      // Update profile
      const { data, error } = await supabase
        .from('profiles')
        .update({
          experience_points: newXP,
          level: newLevel,
          updated_at: new Date()
        })
        .eq('id', user.id)
        .select()
        .single();
        
      if (error) throw error;
      
      // Update local user state with new profile data
      setUser({
        ...user,
        profile: data
      });
      
      return { data, error: null, levelUp: newLevel > currentLevel };
    } catch (error) {
      return { data: null, error };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signOut,
      updateUserExperience
    }}>
      {children}
    </AuthContext.Provider>
  );
};