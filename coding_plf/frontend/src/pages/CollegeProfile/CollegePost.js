import React, { useState } from 'react';
// import CollegeNavbar from '../../components/CollegeNavbar';
const ClubPostPage = () => {
  const [activeTab, setActiveTab] = useState('event'); // 'event' or 'question'
  const [poster, setPoster] = useState(null); // For poster upload

  const handleTabClick = (tab) => {
    setActiveTab(tab); // Switch tab
  };

  const handleEventSubmit = (e) => {
    e.preventDefault();
    // Handle event submission
    console.log('Event submitted with poster:', poster);
  };

  const handleQuestionSubmit = (e) => {
    e.preventDefault();
    // Handle question submission
    console.log('Question submitted');
  };

  const handlePosterChange = (e) => {
    setPoster(e.target.files[0]); // Store the poster file
  };

  return (
    
    <div className="min-h-screen bg-gray-900 text-white">
    {/* <CollegeNavbar/> */}
    <div className='p-8'>
      <h1 className="text-3xl font-bold mb-4">Post {activeTab === 'event' ? 'an Event' : 'a Question'}</h1>
      
      {/* Toggle Tabs */}
      <div className="mb-6 flex justify-center">
        <button
          onClick={() => handleTabClick('event')}
          className={`px-4 py-2 rounded-l-lg ${activeTab === 'event' ? 'bg-cyan-500 text-white' : 'bg-gray-700'}`}
        >
          Post Event
        </button>
        <button
          onClick={() => handleTabClick('question')}
          className={`px-4 py-2 rounded-r-lg ${activeTab === 'question' ? 'bg-cyan-500 text-white' : 'bg-gray-700'}`}
        >
          Post Question
        </button>
      </div>

      {/* Post Event Form */}
      {activeTab === 'event' && (
        <form onSubmit={handleEventSubmit} className="bg-gray-800 p-4 rounded-lg">
          <div className="mb-4">
            <label className="block mb-2">Event Title</label>
            <input
              type="text"
              className="w-full p-2 bg-gray-700 rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Description</label>
            <textarea
              className="w-full p-2 bg-gray-700 rounded-lg"
              required
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="block mb-2">Date</label>
            <input
              type="date"
              className="w-full p-2 bg-gray-700 rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Upload Event Poster</label>
            <input
              type="file"
              className="w-full p-2 bg-gray-700 rounded-lg"
              onChange={handlePosterChange}
            />
            {poster && <p className="mt-2 text-green-500">Poster Uploaded: {poster.name}</p>}
          </div>
          <button type="submit" className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600 transition">
            Submit Event
          </button>
        </form>
      )}

      {/* Post Question Form */}
      {activeTab === 'question' && (
        <form onSubmit={handleQuestionSubmit} className="bg-gray-800 p-4 rounded-lg">
          <div className="mb-4">
            <label className="block mb-2">Your Question</label>
            <textarea
              className="w-full p-2 bg-gray-700 rounded-lg"
              required
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="block mb-2">Tags (comma-separated)</label>
            <input
              type="text"
              className="w-full p-2 bg-gray-700 rounded-lg"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Date Posted</label>
            <input
              type="date"
              className="w-full p-2 bg-gray-700 rounded-lg"
              required
            />
          </div>
          <button type="submit" className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600 transition">
            Submit Question
          </button>
        </form>
      )}
      </div>
    </div>
  );
};

export default ClubPostPage;
