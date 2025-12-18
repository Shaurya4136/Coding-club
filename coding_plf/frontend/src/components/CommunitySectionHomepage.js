import React from 'react';

const CommunitySection = () => {
  return (
    <div className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-center">Join Our Community</h2>
        <p className="mt-4 text-lg text-center text-gray-300">
          Connect with fellow alumni, participate in events, and grow your network.
        </p>

        <div className="mt-10 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-gray-800 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-xl font-bold">Networking</h3>
            <p className="mt-2 text-gray-400">
              Join groups and connect with alumni across industries.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-xl font-bold">Events</h3>
            <p className="mt-2 text-gray-400">
              Stay updated on upcoming alumni events and meetups.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-xl font-bold">Mentorship</h3>
            <p className="mt-2 text-gray-400">
              Get guidance and mentorship from seasoned alumni in your field.
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <a
            href="/community"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-300"
          >
            Explore More
          </a>
        </div>
      </div>
    </div>
  );
};

export default CommunitySection;
