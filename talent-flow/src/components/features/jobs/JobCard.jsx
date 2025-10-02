import React from 'react';
import { Link } from 'react-router-dom';

export default function JobCard({ job }) {
  const { id, title, status, tags } = job;

  const statusStyles = {
    active: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-800',
    draft: 'bg-yellow-100 text-yellow-800'
  };

  const statusColor = statusStyles[status] || statusStyles.draft;

  return (
    <Link to={`/jobs/${id}`} className="block transition-transform hover:scale-102">
      <div className="bg-white shadow-md rounded-lg p-6 mb-4 border border-gray-200 hover:border-blue-400 transition-colors">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600">{title}</h3>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColor} capitalize`}>
            {status}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {tags.map(tag => (
            <span 
              key={tag} 
              className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"></path>
          </svg>
          <span>View Details</span>
        </div>
      </div>
    </Link>
  );
}