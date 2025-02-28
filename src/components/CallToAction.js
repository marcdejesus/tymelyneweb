import React from 'react';

const CallToAction = () => {
  return (
    <section className="py-20 bg-indigo-600">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Achieve Your Goals?
          </h2>
          <p className="text-xl text-indigo-100 mb-10">
            Join thousands of users who are transforming their aspirations into achievements with TymeLyne's AI-powered goal planning.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <a 
              href="/signup" 
              className="bg-white text-indigo-700 px-8 py-4 rounded-full text-lg font-medium hover:bg-indigo-50 transition-colors shadow-md text-center"
            >
              Get Started For Free
            </a>
            <a 
              href="/demo" 
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-indigo-700 transition-colors text-center"
            >
              Schedule a Demo
            </a>
          </div>
          <p className="mt-6 text-indigo-200 text-sm">
            No credit card required. 14-day free trial with full access.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;