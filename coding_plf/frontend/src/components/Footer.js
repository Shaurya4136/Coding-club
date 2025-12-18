import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white py-24">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center md:items-start">
        <div className="text-center md:text-left mb-4 md:mb-0">
          <h2 className="text-2xl font-bold mb-2">
            <span className="text-purple-500">Code</span>HELP
          </h2>
          <p className="text-gray-400">
            The Ultimate Guide To Ace SDE Interviews.
          </p>
        </div>

        <div className="flex flex-col md:flex-row md:space-x-12">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <h3 className="font-semibold mb-2">Quick Links</h3>
            <ul className="space-y-1">
              <li><a href="#" className="text-gray-400 hover:underline">Home</a></li>
              <li><a href="#" className="text-gray-400 hover:underline">Courses</a></li>
              <li><a href="#" className="text-gray-400 hover:underline">DevChallenge</a></li>
              <li><a href="#" className="text-gray-400 hover:underline">Labs</a></li>
              <li><a href="#" className="text-gray-400 hover:underline">Contact</a></li>
            </ul>
          </div>

          <div className="mb-4 md:mb-0 text-center md:text-left">
            <h3 className="font-semibold mb-2">Legal</h3>
            <ul className="space-y-1">
              <li><a href="#" className="text-gray-400 hover:underline">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:underline">Terms of use</a></li>
              <li><a href="#" className="text-gray-400 hover:underline">Refund & Cancellation Policy</a></li>
            </ul>
          </div>

          <div className="text-center md:text-left">
            <h3 className="font-semibold mb-2">Get In Touch</h3>
            <ul className="space-y-1">
              <li><a href="mailto:support@codehelp.in" className="text-gray-400 hover:underline">Support@Codehelp.in</a></li>
              <li className="text-gray-400">📧 8.9 Kbps</li>
              <li className="text-gray-400">📡 1.1 Kbps</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <p className="text-gray-400">&copy; 2024 Sorting Code Help Technologies Pvt Ltd. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
