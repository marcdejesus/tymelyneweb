import React from 'react';
import { Users, MessageCircle, Heart, Share2, UserPlus } from 'lucide-react';

const Community = () => {
  const challenges = [
    { id: 1, title: '30-Day Coding Challenge', participants: 247, daysLeft: 12 },
    { id: 2, title: 'Fitness February', participants: 189, daysLeft: 0 },
    { id: 3, title: 'Reading Marathon', participants: 134, daysLeft: 21 }
  ];
  
  const posts = [
    { 
      id: 1, 
      user: 'Alex Chen', 
      avatar: 'AC', 
      content: 'Just completed my first web development project goal! Check out my portfolio link in bio.',
      likes: 24,
      comments: 7,
      time: '2h ago'
    },
    { 
      id: 2, 
      user: 'Jordan Lee', 
      avatar: 'JL', 
      content: 'Has anyone tried the new time-blocking feature? It\'s helped me increase my productivity by 30%!',
      likes: 18,
      comments: 12,
      time: '5h ago'
    }
  ];

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
      
        {/* Challenges */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-900/30 overflow-hidden border border-gray-100 dark:border-gray-700 mb-6">
          <div className="p-6 md:p-8">
            <div className="flex items-center mb-6">
              <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full mr-4">
                <UserPlus className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Active Challenges</h2>
              <button className="ml-auto text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors">
                View All
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {challenges.map(challenge => (
                <div 
                  key={challenge.id} 
                  className="bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600 p-5 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{challenge.title}</h3>
                  <div className="mt-3 flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300 flex items-center">
                      <Users size={14} className="mr-1" />
                      {challenge.participants} participants
                    </span>
                    <span className={challenge.daysLeft > 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-gray-500 dark:text-gray-400'
                    }>
                      {challenge.daysLeft > 0 
                        ? `${challenge.daysLeft} days left` 
                        : 'Completed'}
                    </span>
                  </div>
                  <button className={`mt-4 w-full py-2 text-sm font-medium text-center rounded-full ${
                    challenge.daysLeft > 0 
                      ? 'border border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                      : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                  } transition-colors`}>
                    {challenge.daysLeft > 0 ? 'Join Challenge' : 'View Results'}
                  </button>
                </div>
              ))}
            </div>
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
              <button className="ml-auto bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-md">
                New Post
              </button>
            </div>
            
            <div className="space-y-6">
              {posts.map(post => (
                <div 
                  key={post.id} 
                  className="bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl p-5 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-medium">
                      {post.avatar}
                    </div>
                    <div className="ml-3">
                      <p className="font-semibold text-gray-900 dark:text-white">{post.user}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{post.time}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 mb-4">{post.content}</p>
                  
                  <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400 border-t dark:border-gray-600 pt-4">
                    <button className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      <Heart size={16} /> {post.likes}
                    </button>
                    <button className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      <MessageCircle size={16} /> {post.comments}
                    </button>
                    <button className="flex items-center gap-1 ml-auto hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      <Share2 size={16} /> Share
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex justify-center">
              <button className="flex items-center gap-2 border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-6 py-2 rounded-full text-sm font-medium transition-colors">
                Load More Posts
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Community;