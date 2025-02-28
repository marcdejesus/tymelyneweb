import React from 'react';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      quote: "TymeLyne transformed how I approach my fitness goals. The AI-generated plan was perfectly tailored to my needs, and the gamification elements kept me motivated on days when I would have otherwise given up.",
      name: "Sarah Johnson",
      title: "Marathon Runner",
      avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&size=64&background=6366F1&color=fff"
    },
    {
      id: 2,
      quote: "As someone learning to code, TymeLyne's progression system made the journey feel less overwhelming. The adaptive difficulty ensured I was always challenged but never discouraged.",
      name: "Marcus Chen",
      title: "Software Developer",
      avatar: "https://ui-avatars.com/api/?name=Marcus+Chen&size=64&background=6366F1&color=fff"
    },
    {
      id: 3,
      quote: "The personalized insights are what make TymeLyne special. It's like having a coach who knows exactly when to push you and when to let you recover. I've achieved more in 3 months than I did all last year.",
      name: "Aisha Patel",
      title: "Small Business Owner",
      avatar: "https://ui-avatars.com/api/?name=Aisha+Patel&size=64&background=6366F1&color=fff"
    }
  ];

  return (
    <section id="testimonials" className="py-20 bg-indigo-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">What Our Users Say</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Join thousands of goal-achievers who are using TymeLyne to turn their aspirations into reality.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white dark:bg-gray-700 rounded-xl shadow-md dark:shadow-gray-900/30 p-8 relative">
              {/* Quote mark */}
              <div className="absolute -top-4 -left-4 bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-2xl font-serif">
                "
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6 italic">{testimonial.quote}</p>
              
              <div className="flex items-center">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name} 
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{testimonial.name}</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{testimonial.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <button className="inline-flex items-center text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-800 dark:hover:text-indigo-300">
            View all testimonials
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;