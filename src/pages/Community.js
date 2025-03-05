import React, { useState, useEffect } from 'react';
import { Users, MessageCircle, Heart, Share2, UserPlus, Loader, X, Image, Send, CalendarCheck } from 'lucide-react';
import supabase from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const Community = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState([]);
  const [posts, setPosts] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [userChallenges, setUserChallenges] = useState([]);
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    goal_type: 'habit',
    target_count: 30
  });

  // Fetch community data
  useEffect(() => {
    const fetchCommunityData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError) throw profileError;
        setUserProfile(profileData);
        
        // Fetch challenges
        const { data: challengesData, error: challengesError } = await supabase
          .from('challenges')
          .select('*, profiles(username, avatar_url)')
          .order('created_at', { ascending: false })
          .limit(6);
        
        if (challengesError) throw challengesError;
        setChallenges(challengesData || []);
        
        // Fetch posts (paginated)
        await fetchPosts();
        
        // Fetch user's joined challenges
        const { data: userChallengesData, error: userChallengesError } = await supabase
          .from('user_challenges')
          .select('challenge_id')
          .eq('user_id', user.id);
        
        if (userChallengesError) throw userChallengesError;
        setUserChallenges(userChallengesData?.map(uc => uc.challenge_id) || []);
        
      } catch (error) {
        console.error('Error fetching community data:', error);
        setError('Failed to load community data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCommunityData();
  }, [user]);

  const fetchPosts = async (append = false) => {
    if (!user) return;
    
    try {
      const page = append ? currentPage + 1 : 0;
      const limit = 5;
      const offset = page * limit;
      
      // First get the posts with their basic info
      const { data: postsData, error: postsError, count } = await supabase
        .from('posts')
        .select('*, profiles(username, avatar_url)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (postsError) throw postsError;
      
      // Then fetch like status for each post
      if (postsData && postsData.length > 0) {
        const postsWithLikes = await Promise.all(postsData.map(async (post) => {
          // Check if current user has liked this post
          const { data: likeData, error: likeError } = await supabase
            .from('post_likes')
            .select('id')
            .eq('post_id', post.id)
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (likeError) console.error('Error checking like status:', likeError);
          
          return {
            ...post,
            is_liked_by_user: !!likeData
          };
        }));
        
        if (append) {
          setPosts(prevPosts => [...prevPosts, ...postsWithLikes]);
        } else {
          setPosts(postsWithLikes);
        }
      } else {
        // No posts found
        if (!append) setPosts([]);
      }
      
      setCurrentPage(page);
      setHasMorePosts(count > (page + 1) * limit);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts');
    }
  };

  const handleLoadMorePosts = async () => {
    await fetchPosts(true);
  };
  
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    
    if (!newPost.trim()) {
      setError('Please enter post content');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: newPost.trim(),
          created_at: new Date().toISOString()
        })
        .select('*, profiles(username, avatar_url)');
      
      if (error) throw error;
      
      if (data) {
        setPosts([data[0], ...posts]);
        setNewPost('');
        setIsPostModalOpen(false);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleLikePost = async (postId, isLiked) => {
    if (!user) return;
    
    try {
      // Update UI optimistically
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, likes: isLiked ? post.likes - 1 : post.likes + 1, is_liked_by_user: !isLiked } 
          : post
      ));
      
      if (isLiked) {
        // Remove like
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);
        
        if (error) throw error;
      } else {
        // Add like
        const { error } = await supabase
          .from('post_likes')
          .insert({
            user_id: user.id,
            post_id: postId,
            created_at: new Date().toISOString()
          });
        
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert the optimistic update on error
      fetchPosts();
    }
  };
  
  const handleJoinChallenge = async (challengeId, isJoined) => {
    if (!user) return;
    
    try {
      if (isJoined) {
        // Leave challenge
        const { error } = await supabase
          .from('user_challenges')
          .delete()
          .eq('user_id', user.id)
          .eq('challenge_id', challengeId);
        
        if (error) throw error;
        
        setUserChallenges(userChallenges.filter(id => id !== challengeId));
      } else {
        // Join challenge
        const { error } = await supabase
          .from('user_challenges')
          .insert({
            user_id: user.id,
            challenge_id: challengeId,
            joined_at: new Date().toISOString(),
            progress: 0
          });
        
        if (error) throw error;
        
        setUserChallenges([...userChallenges, challengeId]);
      }
      
      // Update challenges count
      setChallenges(challenges.map(challenge =>
        challenge.id === challengeId 
          ? { 
              ...challenge, 
              participant_count: isJoined 
                ? (challenge.participant_count - 1) 
                : (challenge.participant_count + 1) 
            }
          : challenge
      ));
    } catch (error) {
      console.error('Error toggling challenge participation:', error);
    }
  };
  
  const handleNewChallengeSubmit = async (e) => {
    e.preventDefault();
    
    if (!newChallenge.title.trim()) {
      setError('Please enter a challenge title');
      return;
    }
    
    if (!newChallenge.start_date || !newChallenge.end_date) {
      setError('Please set both start and end dates');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      // Create new challenge
      const { data, error } = await supabase
        .from('challenges')
        .insert({
          user_id: user.id,
          title: newChallenge.title,
          description: newChallenge.description,
          start_date: newChallenge.start_date,
          end_date: newChallenge.end_date,
          goal_type: newChallenge.goal_type,
          target_count: parseInt(newChallenge.target_count),
          participant_count: 1,
          created_at: new Date().toISOString()
        })
        .select();
      
      if (error) throw error;
      
      if (data) {
        // Join the challenge automatically
        const { error: joinError } = await supabase
          .from('user_challenges')
          .insert({
            user_id: user.id,
            challenge_id: data[0].id,
            joined_at: new Date().toISOString(),
            progress: 0
          });
        
        if (joinError) throw joinError;
        
        // Add user data to challenge for display
        data[0].profiles = {
          username: userProfile.username || userProfile.display_name,
          avatar_url: userProfile.avatar_url
        };
        
        setChallenges([data[0], ...challenges]);
        setUserChallenges([...userChallenges, data[0].id]);
        setNewChallenge({
          title: '',
          description: '',
          start_date: '',
          end_date: '',
          goal_type: 'habit',
          target_count: 30
        });
        setIsChallengeModalOpen(false);
      }
    } catch (error) {
      console.error('Error creating challenge:', error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChallengeInputChange = (e) => {
    const { name, value } = e.target;
    setNewChallenge(prev => ({ ...prev, [name]: value }));
  };
  
  // Format dates for display
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Calculate days remaining in challenge
  const getDaysRemaining = (endDateString) => {
    const endDate = new Date(endDateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const isChallengeLive = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return now >= start && now <= end;
  };
  
  const getChallengeStatus = (challenge) => {
    const now = new Date();
    const startDate = new Date(challenge.start_date);
    const endDate = new Date(challenge.end_date);
    
    if (now < startDate) {
      return {
        label: 'Starting Soon',
        daysText: `Starts in ${getDaysRemaining(startDate.toISOString())} days`,
        color: 'text-blue-600 dark:text-blue-400',
        buttonText: userChallenges.includes(challenge.id) ? 'Leave Challenge' : 'Join Challenge'
      };
    } else if (now <= endDate) {
      return {
        label: 'In Progress',
        daysText: `${getDaysRemaining(endDate.toISOString())} days left`,
        color: 'text-green-600 dark:text-green-400',
        buttonText: userChallenges.includes(challenge.id) ? 'View Progress' : 'Join Now'
      };
    } else {
      return {
        label: 'Completed',
        daysText: 'Challenge ended',
        color: 'text-gray-500 dark:text-gray-400',
        buttonText: userChallenges.includes(challenge.id) ? 'View Results' : 'See Results'
      };
    }
  };

  // Format relative time for posts (e.g., "2h ago")
  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return formatDate(dateString);
  };
// Add additional state variables
const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
const [comments, setComments] = useState([]);
const [newComment, setNewComment] = useState('');
const [activePostId, setActivePostId] = useState(null);
const [selectedChallenge, setSelectedChallenge] = useState(null);
const [isUserJoined, setIsUserJoined] = useState(false);
const [challengeParticipants, setChallengeParticipants] = useState([]);
const [userProgress, setUserProgress] = useState(0);
const [progressUpdate, setProgressUpdate] = useState(0);

// Handle opening the comments modal
const handleShowComments = async (postId) => {
  try {
    setActivePostId(postId);
    setIsCommentModalOpen(true);
    setNewComment('');
    
    // Fetch comments for this post
    const { data, error } = await supabase
      .from('comments')
      .select('*, profiles(username, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    setComments(data || []);
    
  } catch (error) {
    console.error('Error fetching comments:', error);
  }
};

// Handle submitting a new comment
const handleCommentSubmit = async (e) => {
  e.preventDefault();
  
  if (!newComment.trim()) return;
  
  try {
    setIsSubmitting(true);
    
    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: user.id,
        post_id: activePostId,
        content: newComment.trim(),
        created_at: new Date().toISOString()
      })
      .select('*, profiles(username, avatar_url)');
    
    if (error) throw error;
    
    if (data) {
      // Add comment to the list
      setComments([...comments, data[0]]);
      
      // Update post comment count
      setPosts(posts.map(post => 
        post.id === activePostId
          ? { ...post, comment_count: (post.comment_count || 0) + 1 }
          : post
      ));
      
      setNewComment('');
    }
  } catch (error) {
    console.error('Error adding comment:', error);
  } finally {
    setIsSubmitting(false);
  }
};

// Handle showing challenge details
const handleShowChallengeDetails = async (challenge) => {
  try {
    setSelectedChallenge(challenge);
    
    // Check if user is part of this challenge
    const isJoined = userChallenges.includes(challenge.id);
    setIsUserJoined(isJoined);
    
    // Fetch participants for this challenge with their profiles data
    const { data: participantsData, error: participantsError } = await supabase
      .from('user_challenges')
      .select(`
        id, 
        user_id,
        progress, 
        joined_at,
        profiles:user_id(username, avatar_url)
      `)
      .eq('challenge_id', challenge.id);
    
    if (participantsError) throw participantsError;
    setChallengeParticipants(participantsData || []);
    
    // If user is joined, get their progress
    if (isJoined) {
      const { data: userProgressData, error: userProgressError } = await supabase
        .from('user_challenges')
        .select('progress')
        .eq('challenge_id', challenge.id)
        .eq('user_id', user.id)
        .single();
      
      if (userProgressError && userProgressError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" - not actually an error in this case
        throw userProgressError;
      }
      
      if (userProgressData) {
        setUserProgress(userProgressData.progress || 0);
        setProgressUpdate(userProgressData.progress || 0);
      } else {
        setUserProgress(0);
        setProgressUpdate(0);
      }
    }
  } catch (error) {
    console.error('Error fetching challenge details:', error);
    setError('Failed to load challenge details');
  }
};

// Handle updating user's challenge progress
const handleProgressUpdate = async () => {
  if (!selectedChallenge || !user) return;
  
  try {
    setIsSubmitting(true);
    
    const { error } = await supabase
      .from('user_challenges')
      .update({
        progress: progressUpdate
      })
      .eq('challenge_id', selectedChallenge.id)
      .eq('user_id', user.id);
    
    if (error) throw error;
    
    // Update local state
    setUserProgress(progressUpdate);
    
    // Update participants list
    setChallengeParticipants(challengeParticipants.map(participant => 
      participant.user_id === user.id
        ? { ...participant, progress: progressUpdate }
        : participant
    ));
    
    // Show success message
    setError('');
    
  } catch (error) {
    console.error('Error updating progress:', error);
    setError('Failed to update progress');
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <section className="pt-6 pb-12 md:pt-8 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
            Community <span className="text-indigo-600 dark:text-indigo-400">&amp; Challenges</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl">
            Connect with others, join challenges, and share your progress to stay motivated.
          </p>
        </div>
      
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="h-8 w-8 text-indigo-500 animate-spin" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading community data...</span>
          </div>
        ) : (
          <>
            {/* Challenges */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-900/30 overflow-hidden border border-gray-100 dark:border-gray-700 mb-6">
              <div className="p-6 md:p-8">
                <div className="flex items-center mb-6">
                  <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full mr-4">
                    <UserPlus className="text-green-600 dark:text-green-400" size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Active Challenges</h2>
                  <button 
                    onClick={() => setIsChallengeModalOpen(true)}
                    className="ml-auto bg-green-600 hover:bg-green-700 dark:hover:bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-md"
                  >
                    Create Challenge
                  </button>
                </div>
                
                {challenges.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="bg-gray-100 dark:bg-gray-700 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserPlus className="text-gray-500 dark:text-gray-400" size={24} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Active Challenges</h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto mb-6">
                      Be the first to create a community challenge and invite others to join!
                    </p>
                    <button 
                      onClick={() => setIsChallengeModalOpen(true)}
                      className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 dark:hover:bg-green-500 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors shadow-md"
                    >
                      <UserPlus size={16} />
                      Create Your First Challenge
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {challenges.map(challenge => {
                      const status = getChallengeStatus(challenge);
                      const isJoined = userChallenges.includes(challenge.id);
                      
                      return (
                        <div 
                          key={challenge.id} 
                          className="bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600 p-5 hover:shadow-md transition-shadow"
                        >
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{challenge.title}</h3>
                          
                          <div className="mt-2 flex items-center text-xs text-gray-600 dark:text-gray-400">
                            <div className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mr-1">
                              {challenge.profiles?.avatar_url ? (
                                <img 
                                  src={challenge.profiles.avatar_url} 
                                  alt="" 
                                  className="h-6 w-6 rounded-full"
                                />
                              ) : (
                                <span className="text-indigo-600 dark:text-indigo-400 text-xs font-medium">
                                  {challenge.profiles?.username?.substring(0, 2).toUpperCase() || 'U'}
                                </span>
                              )}
                            </div>
                            <span>
                              Created by {challenge.profiles?.username || 'Anonymous'}
                            </span>
                          </div>
                          
                          <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                            {challenge.description?.substring(0, 60)}
                            {challenge.description?.length > 60 ? '...' : ''}
                          </div>
                          
                          <div className="mt-3 flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-300 flex items-center">
                              <Users size={14} className="mr-1" />
                              {challenge.participant_count} participants
                            </span>
                            <span className={status.color}>
                              {status.daysText}
                            </span>
                          </div>
                          
                          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                            <CalendarCheck size={12} className="mr-1" />
                            <span>{formatDate(challenge.start_date)} - {formatDate(challenge.end_date)}</span>
                          </div>
                          
                          <button 
                            onClick={() => isJoined ? handleShowChallengeDetails(challenge) : handleJoinChallenge(challenge.id, isJoined)}
                            className={`mt-4 w-full py-2 text-sm font-medium text-center rounded-full ${
                              isJoined 
                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50'
                                : 'border border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                            } transition-colors`}
                            disabled={!isChallengeLive(challenge.start_date, challenge.end_date) && !isJoined}
                          >
                            {status.buttonText}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            
            {/* Community Posts */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-900/30 overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className="p-6 md:p-8">
                <div className="flex items-center mb-6">
                  <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full mr-4">
                    <MessageCircle className="text-indigo-600 dark:text-indigo-400" size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Community Posts</h2>
                  <button 
                    onClick={() => setIsPostModalOpen(true)}
                    className="ml-auto bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-md"
                  >
                    New Post
                  </button>
                </div>
                
                {posts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="bg-gray-100 dark:bg-gray-700 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="text-gray-500 dark:text-gray-400" size={24} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Posts Yet</h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto mb-6">
                      Be the first to share your progress or ask a question to the community!
                    </p>
                    <button 
                      onClick={() => setIsPostModalOpen(true)}
                      className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors shadow-md"
                    >
                      <MessageCircle size={16} />
                      Create First Post
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {posts.map(post => (
                      <div 
                        key={post.id} 
                        className="bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl p-5 hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex items-center mb-4">
                          <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-medium overflow-hidden">
                            {post.profiles?.avatar_url ? (
                              <img 
                                src={post.profiles.avatar_url} 
                                alt=""
                                className="h-12 w-12 object-cover" 
                              />
                            ) : (
                              post.profiles?.username?.substring(0, 2).toUpperCase() || 'U'
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {post.profiles?.username || 'Anonymous User'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {getRelativeTime(post.created_at)}
                            </p>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">
                          {post.content}
                        </p>
                        
                        <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400 border-t dark:border-gray-600 pt-4">
                          <button 
                            className={`flex items-center gap-1 transition-colors ${
                              post.is_liked_by_user ? 'text-pink-500 dark:text-pink-400' : 'hover:text-indigo-600 dark:hover:text-indigo-400'
                            }`}
                            onClick={() => handleLikePost(post.id, post.is_liked_by_user)}
                          >
                            <Heart size={16} fill={post.is_liked_by_user ? 'currentColor' : 'none'} /> {post.likes || 0}
                          </button>
                          <button 
                            className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            onClick={() => handleShowComments(post.id)}
                          >
                            <MessageCircle size={16} /> {post.comment_count || 0}
                          </button>
                          <button className="flex items-center gap-1 ml-auto hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                            <Share2 size={16} /> Share
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {posts.length > 0 && hasMorePosts && (
                  <div className="mt-8 flex justify-center">
                    <button 
                      onClick={handleLoadMorePosts}
                      className="flex items-center gap-2 border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-6 py-2 rounded-full text-sm font-medium transition-colors"
                    >
                      Load More Posts
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* New Post Modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full p-6 relative">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Post</h2>
              <button 
                onClick={() => setIsPostModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
            
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handlePostSubmit}>
              <div className="mb-6">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-36 resize-none"
                  placeholder="What's on your mind? Share your progress or ask the community..."
                  maxLength={1000}
                />
                <div className="text-right text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {newPost.length}/1000
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  className="flex items-center gap-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Image size={16} /> Add Image
                </button>
                
                <div className="flex-grow"></div>
                
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-5 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors disabled:opacity-70"
                  disabled={isSubmitting || !newPost.trim()}
                >
                  Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* New Challenge Modal with complete implementation */}
{isChallengeModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full p-6 relative overflow-y-auto max-h-[90vh]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Challenge</h2>
        <button 
          onClick={() => setIsChallengeModalOpen(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <X size={20} />
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleNewChallengeSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-1" htmlFor="title">
              Challenge Title*
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={newChallenge.title}
              onChange={handleChallengeInputChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="E.g., 30 Days of Daily Meditation"
              maxLength={100}
            />
          </div>
          
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-1" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={newChallenge.description}
              onChange={handleChallengeInputChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-24 resize-none"
              placeholder="Describe what this challenge is about and how others can participate..."
              maxLength={500}
            />
            <div className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">
              {newChallenge.description.length}/500
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-1" htmlFor="start_date">
                Start Date*
              </label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={newChallenge.start_date}
                onChange={handleChallengeInputChange}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-1" htmlFor="end_date">
                End Date*
              </label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                value={newChallenge.end_date}
                onChange={handleChallengeInputChange}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-1" htmlFor="goal_type">
              Challenge Type
            </label>
            <select
              id="goal_type"
              name="goal_type"
              value={newChallenge.goal_type}
              onChange={handleChallengeInputChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="habit">Daily Habit</option>
              <option value="goal">Goal Completion</option>
              <option value="progress">Progress Based</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-1" htmlFor="target_count">
              Target Count
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                (days, items, percent, etc.)
              </span>
            </label>
            <input
              type="number"
              id="target_count"
              name="target_count"
              value={newChallenge.target_count}
              onChange={handleChallengeInputChange}
              min="1"
              max="1000"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        
        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setIsChallengeModalOpen(false)}
            className="px-5 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-1 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-500 transition-colors disabled:opacity-70"
            disabled={isSubmitting}
          >
            Create Challenge
          </button>
        </div>
      </form>
    </div>
  </div>
)}

{/* Comment Modal - Add to implement post comments */}
{isCommentModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full p-6 relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Comments</h2>
        <button 
          onClick={() => setIsCommentModalOpen(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="max-h-80 overflow-y-auto mb-4">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              No comments yet. Be the first to comment!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="flex items-center mb-2">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-medium overflow-hidden">
                    {comment.profiles?.avatar_url ? (
                      <img 
                        src={comment.profiles.avatar_url} 
                        alt=""
                        className="h-8 w-8 object-cover" 
                      />
                    ) : (
                      comment.profiles?.username?.substring(0, 2).toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="ml-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {comment.profiles?.username || 'Anonymous User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {getRelativeTime(comment.created_at)}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <form onSubmit={handleCommentSubmit} className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Add a comment..."
            maxLength={300}
          />
          <button
            type="submit"
            className="flex items-center justify-center p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors disabled:opacity-70"
            disabled={isSubmitting || !newComment.trim()}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  </div>
)}

{/* Challenge Details Modal */}
{selectedChallenge && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedChallenge.title}</h2>
        <button 
          onClick={() => setSelectedChallenge(null)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mr-2">
            {selectedChallenge.profiles?.avatar_url ? (
              <img 
                src={selectedChallenge.profiles.avatar_url} 
                alt="" 
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <span className="text-indigo-600 dark:text-indigo-400 text-xs font-medium">
                {selectedChallenge.profiles?.username?.substring(0, 2).toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <span>
            Created by {selectedChallenge.profiles?.username || 'Anonymous'}
          </span>
        </div>
        
        <p className="text-gray-700 dark:text-gray-300">
          {selectedChallenge.description || 'No description provided.'}
        </p>
        
        <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Start Date</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {new Date(selectedChallenge.start_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">End Date</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {new Date(selectedChallenge.end_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Challenge Type</p>
            <p className="font-medium text-gray-900 dark:text-white capitalize">
              {selectedChallenge.goal_type}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Target</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {selectedChallenge.target_count} {selectedChallenge.goal_type === 'habit' ? 'days' : 'units'}
            </p>
          </div>
        </div>
        
        {isUserJoined && (
          <div>
            <h3 className="font-medium text-lg text-gray-900 dark:text-white mb-2">Your Progress</h3>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4 mb-1">
              <div 
                className="bg-green-500 dark:bg-green-600 h-4 rounded-full transition-all duration-700 ease-in-out"
                style={{ width: `${(userProgress / selectedChallenge.target_count) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {userProgress} / {selectedChallenge.target_count}
              </span>
              <span className="text-green-600 dark:text-green-400 font-medium">
                {Math.round((userProgress / selectedChallenge.target_count) * 100)}% complete
              </span>
            </div>
            
            <div className="mt-6">
              <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="progress_update">
                Update Progress
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  id="progress_update"
                  value={progressUpdate}
                  onChange={e => setProgressUpdate(Math.max(0, parseInt(e.target.value) || 0))}
                  min="0"
                  max={selectedChallenge.target_count}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button 
                  onClick={handleProgressUpdate}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-500 transition-colors"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}
        
        <h3 className="font-medium text-lg text-gray-900 dark:text-white mt-4">Participants</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {challengeParticipants.map(participant => (
            <div key={participant.id} className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mr-2">
                {participant.profiles?.avatar_url ? (
                  <img 
                    src={participant.profiles.avatar_url} 
                    alt="" 
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <span className="text-indigo-600 dark:text-indigo-400 text-xs font-medium">
                    {participant.profiles?.username?.substring(0, 2).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {participant.profiles?.username || 'Anonymous'}
                </p>
                <div className="flex items-center">
                  <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full mr-1">
                    <div 
                      className="bg-green-500 dark:bg-green-600 h-1.5 rounded-full"
                      style={{ width: `${(participant.progress / selectedChallenge.target_count) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.round((participant.progress / selectedChallenge.target_count) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex justify-end gap-3">
          <button 
            onClick={() => setSelectedChallenge(null)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
          {!isUserJoined && isChallengeLive(selectedChallenge.start_date, selectedChallenge.end_date) && (
            <button 
              onClick={() => handleJoinChallenge(selectedChallenge.id, false)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors"
            >
              Join Challenge
            </button>
          )}
          {isUserJoined && (
            <button 
              onClick={() => handleJoinChallenge(selectedChallenge.id, true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Leave Challenge
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
)}

    </section>
  );
};

export default Community;