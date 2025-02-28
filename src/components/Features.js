import React, { useState } from 'react';

const Features = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  
  const features = [
    {
      id: 1,
      title: "AI-Powered Goal Planning",
      description: "Simply input your goal, and our advanced AI generates a structured plan with customized milestones and adaptive tasks. Whether you're training for a marathon, learning a new skill, or building a business, TymeLyne creates a detailed roadmap tailored to your specific needs.",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      image: "/goalpage.png"
    },
    {
      id: 2,
      title: "Gamification & Motivation",
      description: "Stay motivated with our engaging reward system. Earn XP, level up, unlock achievements, maintain streaks, and compete on leaderboards. TymeLyne transforms goal pursuit into a rewarding journey, using proven psychological techniques to keep you engaged and committed.",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      image: "/achievement.png"
    },
    {
      id: 3,
      title: "Progress Tracking & Adaptability",
      description: "Visualize your journey with our intuitive timeline view that showcases completed and upcoming milestones. The AI constantly monitors your progress, adjusting task difficulty and milestones based on your performance, ensuring your plan remains challenging yet achievable.",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      image: "/progress.png"
    },
    {
      id: 4,
      title: "Personalized AI Insights",
      description: "Benefit from intelligent recommendations and motivational feedback tailored to your unique progress patterns. Our AI identifies areas for improvement, suggests optimization strategies, and provides the encouragement you need at just the right moments to keep you moving forward.",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      image: "/dashboard.png"
    },
    {
      id: 5,
      title: "Community & Social Features",
      description: "Connect with like-minded individuals pursuing similar goals. Share your progress, join accountability groups, and participate in challenges with friends. The social dimension of TymeLyne provides the support network and healthy competition that can significantly increase your chances of success.",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      image: "/community.png"
    }
  ];

  return (
    <section id="features" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Key Features</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Powerful tools designed to transform how you set, track, and achieve your most ambitious goals.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-4 mb-12">
          {features.map((feature, index) => (
            <button
              key={feature.id}
              className={`p-6 rounded-lg text-left transition-all duration-200 ${
                activeFeature === index 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700'
              }`}
              onClick={() => setActiveFeature(index)}
            >
              <div className={`${activeFeature === index ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mt-4">{feature.title}</h3>
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2 p-8 md:p-12">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {features[activeFeature].title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {features[activeFeature].description}
              </p>
              <button className="inline-flex items-center text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-800 dark:hover:text-indigo-300">
                Learn more
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
            <div className="md:w-1/2 bg-gray-100 dark:bg-gray-700">
              <img 
                src={features[activeFeature].image} 
                alt={features[activeFeature].title} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;