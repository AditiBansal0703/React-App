// ✅ Correct setup in src/App.jsx

import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import JobsBoardPage from './pages/JobsBoardPage';
import CandidatesPage from './pages/CandidatesPage';
import JobDetailPage from './pages/JobDetailPage';
import CandidateProfilePage from './pages/CandidateProfilePage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  TalentFlow
                </span>
              </Link>
              <div className="ml-10 flex items-center space-x-8">
                <Link 
                  to="/" 
                  className={`nav-link text-gray-600 hover:text-blue-600 hover:border-blue-600 px-3 py-2 text-sm font-medium border-b-2 border-transparent transition-colors duration-200`}
                >
                  Jobs Board
                </Link>
                <Link 
                  to="/candidates" 
                  className={`nav-link text-gray-600 hover:text-blue-600 hover:border-blue-600 px-3 py-2 text-sm font-medium border-b-2 border-transparent transition-colors duration-200`}
                >
                  Candidates
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <button className="flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="ml-4 relative flex items-center">
                <button className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">JD</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        <Routes>
          <Route path="/" element={<JobsBoardPage />} />
          <Route path="/candidates" element={<CandidatesPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/candidates/:id" element={<CandidateProfilePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            © 2025 TalentFlow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;