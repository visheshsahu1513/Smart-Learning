import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      {/* --- NEW: Changed py-8 to py-6 to reduce vertical padding --- */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Column 1: About */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">About</h3>
            <ul className="mt-4 space-y-3"> {/* Reduced space between links */}
              <li><Link to="#" className="text-base text-gray-500 hover:text-gray-900">Our Mission</Link></li>
              <li><Link to="#" className="text-base text-gray-500 hover:text-gray-900">Careers</Link></li>
              <li><Link to="#" className="text-base text-gray-500 hover:text-gray-900">Press</Link></li>
            </ul>
          </div>
          {/* Column 2: Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Resources</h3>
            <ul className="mt-4 space-y-3"> {/* Reduced space between links */}
              <li><Link to="#" className="text-base text-gray-500 hover:text-gray-900">Help Center</Link></li>
              <li><Link to="#" className="text-base text-gray-500 hover:text-gray-900">Blog</Link></li>
              <li><Link to="#" className="text-base text-gray-500 hover:text-gray-900">Community</Link></li>
            </ul>
          </div>
          {/* Column 3: Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-3"> {/* Reduced space between links */}
              <li><Link to="#" className="text-base text-gray-500 hover:text-gray-900">Privacy Policy</Link></li>
              <li><Link to="#" className="text-base text-gray-500 hover:text-gray-900">Terms of Service</Link></li>
            </ul>
          </div>
          {/* Column 4: Social */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Connect</h3>
            <ul className="mt-4 space-y-3"> {/* Reduced space between links */}
              <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">Twitter</a></li>
              <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">Facebook</a></li>
              <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">LinkedIn</a></li>
            </ul>
          </div>
        </div>
        {/* --- NEW: Changed mt-8 to mt-6 and pt-8 to pt-6 to reduce spacing --- */}
        <div className="mt-6 border-t border-gray-200 pt-6">
          <p className="text-base text-gray-400 text-center">&copy; {new Date().getFullYear()} Smart LMS, Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;