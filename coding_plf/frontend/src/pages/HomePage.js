import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import Footer from '../components/Footer';
import CommunitySection from '../components/CommunitySectionHomepage';
import video from "../assets/HomePage/video1.mp4";

const HomePage = () => {
  const [language, setLanguage] = useState('python3');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [gradientPositions, setGradientPositions] = useState({});
  const eventsRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  const handleCodeChange = (event) => {
    setCode(event.target.value);
  };

  const handleRunCode = async () => {
    try {
      const response = await axios.post('http://localhost:5000/', { language, code });
      setOutput(response.data.output);
    } catch (error) {
      setOutput('Error: ' + error.message);
    }
  };

  const handleMouseMove = (e, cardIndex) => {
    const card = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - card.left;
    const y = e.clientY - card.top;
    setGradientPositions(prev => ({ ...prev, [cardIndex]: { x, y } }));
  };

  
  useEffect(() => {
    let scrollInterval;
  
    const scrollLoop = () => {
      if (!isHovered && eventsRef.current) {
        eventsRef.current.scrollLeft += 2;
  
        // Reset scroll when reaching the middle of the content
        if (eventsRef.current.scrollLeft >= eventsRef.current.scrollWidth / 2) {
          eventsRef.current.scrollLeft = 0; // Jump back to the start
        }
      }
      scrollInterval = requestAnimationFrame(scrollLoop);
    };
  
    // Start the scrolling
    scrollLoop();
  
    // Clean up on unmount
    return () => cancelAnimationFrame(scrollInterval);
  }, [isHovered]);
        

  return (
    <div>
      <Navbar />

      {/* Hero Section */}
      <section id="home" className="relative bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white min-h-screen h-screen flex items-center justify-center overflow-hidden">
        {/* Background video */}
        <video className="absolute inset-0 w-full h-full object-cover z-0" autoPlay loop muted playsInline>
            <source src={video} type="video/mp4" />
            Your browser does not support the video tag.
        </video>

        {/* Content */}
        <div className="relative z-10 container mx-auto text-center w-full">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                Crack the Code
            </span>
            <br /> to Success with <span className="text-indigo-400">CodeHelp</span>
            </h1>
            <p className="mt-6 text-lg md:text-2xl text-gray-300 max-w-2xl mx-auto">
            Browse our programming skills, take challenges, and unlock coding possibilities.
            </p>

            <div className="mt-10 flex justify-center space-x-6">
            <button className="bg-gradient-to-r from-blue-500 to-teal-400 text-white font-semibold px-6 py-3 md:px-8 md:py-4 rounded-full shadow-lg transform hover:scale-110 transition duration-300 ease-in-out">
                <i className="fas fa-book-open mr-2"></i> View Courses
            </button>
            <button className="bg-gradient-to-r from-red-500 to-pink-400 text-white font-semibold px-6 py-3 md:px-8 md:py-4 rounded-full shadow-lg transform hover:scale-110 transition duration-300 ease-in-out">
                <i className="fas fa-play-circle mr-2"></i> Watch Video
            </button>
            </div>
        </div>

        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-black opacity-50 z-0"></div>
        </section>



      {/* Code Editor Section */}
      <section id="editor" className="bg-gray-900  text-white p-16">
        <h1 className="text-3xl font-bold mb-8">Programiz Online Compiler</h1>
        <div className="p-6 bg-gray-800 rounded-lg  shadow-lg transform transition-transform duration-300 hover:shadow-[0_0_30px_5px_rgba(255,0,0,0.5),0_0_30px_5px_rgba(0,255,0,0.5),0_0_30px_5px_rgba(0,0,255,0.5)] hover:scale-105">
          <div className="md:flex md:w-full">
            <div className="md:w-2/3 p-4 bg-gray-700 rounded-lg">
              <select value={language} onChange={handleLanguageChange} className="mb-4 p-2 bg-gray-600 text-white rounded">
                <option value="python3">Python 3</option>
                <option value="javascript">JavaScript</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="csharp">C#</option>
                <option value="ruby">Ruby</option>
                <option value="php">PHP</option>
              </select>
              <textarea
                value={code}
                onChange={handleCodeChange}
                rows="10"
                cols="50"
                className="w-full p-4 bg-gray-600 text-white rounded"
                placeholder="Write your code here..."
              ></textarea>
              <button
                onClick={handleRunCode}
                className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500 transition duration-300 ease-in-out"
              >
                Run
              </button>
            </div>
            <div className="md:w-1/3 md:ml-4 p-4 bg-gray-700 rounded-lg">
              <p className="text-lg font-semibold">Output:</p>
              <pre className="whitespace-pre-wrap">{output}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section id="welcome" className="relative bg-cover bg-center p-20 text-center text-white" style={{ backgroundImage: 'url(/path/to/your/background.jpg)' }}>
        <div className="absolute inset-0 bg-black opacity-50"></div>

        <div className="relative z-10 mt-10">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Welcome to <span className="text-yellow-300">Oxnard College</span>
          </h2>

          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Discover endless opportunities at Oxnard College, where education meets innovation.
          </p>

          <button className="mt-4 bg-white text-black px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-yellow-300 transition duration-300 ease-in-out">
            About Oxnard College
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="explore" className="bg-gray-900 text-white p-16 text-left">
        <h2 className="text-3xl font-bold mb-8 text-center">Explore Our Features</h2>
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((cardIndex) => (
            <div
              key={cardIndex}
              className={`relative group bg-black p-6 rounded-lg shadow-lg cursor-pointer transform transition-transform duration-300 
                ${cardIndex === 1 ? 'hover:shadow-[0_0_30px_5px_rgba(255,165,0,0.5)] hover:scale-105' : ''}
                ${cardIndex === 2 ? 'hover:shadow-[0_0_30px_5px_rgba(255,20,147,0.5)] hover:scale-105' : ''}
                ${cardIndex === 3 ? 'hover:shadow-[0_0_30px_5px_rgba(0,255,0,0.5)] hover:scale-105' : ''}
                ${cardIndex === 4 ? 'hover:shadow-[0_0_30px_5px_rgba(0,0,255,0.5)] hover:scale-105' : ''}`}
              onMouseMove={(e) => handleMouseMove(e, cardIndex)}
              style={{
                background: `radial-gradient(circle at ${gradientPositions[cardIndex]?.x || 0}px ${gradientPositions[cardIndex]?.y || 0}px, rgba(0, 102, 255, 0.3), transparent)`,
              }}
            >
              <div className="absolute top-2 right-2">
                <svg
                  className={`w-6 h-6 
                    ${cardIndex === 1 ? 'text-orange-500' : ''}
                    ${cardIndex === 2 ? 'text-pink-500' : ''}
                    ${cardIndex === 3 ? 'text-green-500' : ''}
                    ${cardIndex === 4 ? 'text-blue-500' : ''}`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {cardIndex === 1 ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  ) : cardIndex === 2 ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  ) : cardIndex === 3 ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7l8 10M8 17l8-10" />
                  )}
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Feature {cardIndex}</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>
          ))}
        </div>
      </section>
      <section>
        <div>
            {/* Community Section */}
            <CommunitySection />
        </div>
      </section>

      {/* Event Card */}
      <section className="bg-gray-900 text-white py-16">
      <div className="container mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Upcoming Events</h2>
        <div
          ref={eventsRef}
          className="flex space-x-8 overflow-x-auto scrollbar-hide"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{ whiteSpace: 'nowrap' }}  // Keep items in a row
        >
          {/* Original Event List */}
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="min-w-[300px] relative bg-black p-6 rounded-lg shadow-lg overflow-hidden group transform transition-all duration-500 hover:scale-105 hover:shadow-xl"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${
                  index % 3 === 0
                    ? 'from-indigo-600 via-purple-600 to-pink-500'
                    : index % 3 === 1
                    ? 'from-teal-500 via-green-600 to-blue-500'
                    : 'from-yellow-500 via-orange-600 to-red-500'
                } opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              ></div>
              <div className="relative z-10 p-6">
                <h3 className="text-2xl font-bold mb-2 transition-transform duration-300 transform group-hover:scale-110">
                  Event Name {index + 1}
                </h3>
                <p className="text-gray-300 mb-2">Date: Date {index + 1}</p>
                <p className="text-gray-300 mb-2">Location: Location {index + 1}</p>
                <p className="text-gray-400 mb-4">
                  A brief description of the event. This can include the purpose, activities, and any other relevant details.
                </p>
                <a
                  href="#"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition-transform transform hover:scale-110"
                >
                  Learn More
                </a>
              </div>
            </div>
          ))}

          {/* Duplicate Event List for Looping */}
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="min-w-[300px] relative bg-black p-6 rounded-lg shadow-lg overflow-hidden group transform transition-all duration-500 hover:scale-105 hover:shadow-xl"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${
                  index % 3 === 0
                    ? 'from-indigo-600 via-purple-600 to-pink-500'
                    : index % 3 === 1
                    ? 'from-teal-500 via-green-600 to-blue-500'
                    : 'from-yellow-500 via-orange-600 to-red-500'
                } opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              ></div>
              <div className="relative z-10 p-6">
                <h3 className="text-2xl font-bold mb-2 transition-transform duration-300 transform group-hover:scale-110">
                  Event Name {index + 1}
                </h3>
                <p className="text-gray-300 mb-2">Date: Date {index + 1}</p>
                <p className="text-gray-300 mb-2">Location: Location {index + 1}</p>
                <p className="text-gray-400 mb-4">
                  A brief description of the event. This can include the purpose, activities, and any other relevant details.
                </p>
                <a
                  href="#"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition-transform transform hover:scale-110"
                >
                  Learn More
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

      {/* Contact Section */}
      <section id="contact" className="bg-gray-900 text-white p-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Get in Touch</h2>
        <div className="flex justify-center">
          <div
            className="relative group bg-black p-8 rounded-lg shadow-lg transform transition-transform duration-300 hover:shadow-[0_0_30px_5px_rgba(255,0,0,0.5),0_0_30px_5px_rgba(0,255,0,0.5),0_0_30px_5px_rgba(0,0,255,0.5)] hover:scale-105 w-full md:w-2/3 lg:w-1/2"
            onMouseMove={(e) => handleMouseMove(e, 'contact')}
            style={{
              background: `radial-gradient(circle at ${gradientPositions['contact']?.x || 0}px ${gradientPositions['contact']?.y || 0}px, rgba(0, 102, 255, 0.3), transparent)`,
            }}
          >
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/2 pr-4 mb-4 md:mb-0">
                <h3 className="text-xl font-semibold mb-4">Contact Details</h3>
                <p className="mb-2">Address: 1234 Street Name, City, Country</p>
                <p className="mb-2">Phone: +123 456 7890</p>
                <p className="mb-2">Email: contact@example.com</p>
              </div>
              <div className="w-full md:w-1/2">
                <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
                <form>
                  <div className="mb-4">
                    <label className="block text-gray-400 mb-2">Name</label>
                    <input type="text" className="w-full p-3 bg-gray-800 text-white rounded" placeholder="Your Name" />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-400 mb-2">Email</label>
                    <input type="email" className="w-full p-3 bg-gray-800 text-white rounded" placeholder="Your Email" />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-400 mb-2">Message</label>
                    <textarea className="w-full p-3 bg-gray-800 text-white rounded" rows="4" placeholder="Your Message"></textarea>
                  </div>
                  <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500 transition duration-300 ease-in-out">
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
