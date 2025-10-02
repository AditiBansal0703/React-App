import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { useCandidates } from '../../../api/useCandidates';
import Spinner from '../../ui/Spinner';
import { Table } from '../../ui/Table';

const getStageColor = (stage) => {
  const colors = {
    applied: 'bg-gray-100 text-gray-800',
    screen: 'bg-blue-100 text-blue-800',
    tech: 'bg-purple-100 text-purple-800',
    offer: 'bg-yellow-100 text-yellow-800',
    hired: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  };
  return colors[stage] || colors.applied;
};

export default function CandidatesTable({ jobId, onCandidateClick }) {
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const { candidates, loading, error } = useCandidates(jobId);

  const filteredAndSortedCandidates = useMemo(() => {
    if (!candidates) return [];
    
    let result = [...candidates];
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        candidate =>
          candidate.name.toLowerCase().includes(searchLower) ||
          candidate.email.toLowerCase().includes(searchLower) ||
          candidate.skills?.some(skill => skill.toLowerCase().includes(searchLower)) ||
          candidate.stage.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortConfig.key === 'skills') {
        return ((a.skills?.length || 0) - (b.skills?.length || 0)) * 
               (sortConfig.direction === 'asc' ? 1 : -1);
      }
      
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (typeof aValue === 'string') {
        return aValue.localeCompare(bValue) * (sortConfig.direction === 'asc' ? 1 : -1);
      }
      
      return (aValue - bValue) * (sortConfig.direction === 'asc' ? 1 : -1);
    });

    return result;
  }, [candidates, search, sortConfig]);

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (row) => (
        <button
          className="flex items-center w-full text-left focus:outline-none"
          onClick={() => {
            if (onCandidateClick) onCandidateClick(row);
            else console.log('Candidate clicked:', row);
          }}
        >
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-600 font-medium">
                {row.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="font-medium underline hover:text-blue-600">{row.name}</div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </button>
      ),
    },
    {
      key: 'stage',
      header: 'Stage',
      render: (row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
          ${getStageColor(row.stage)}`}
        >
          {row.stage}
        </span>
      ),
    },
    {
      key: 'experience',
      header: 'Experience',
      render: (row) => row.experience ? `${row.experience} years` : 'Not specified',
    },
    {
      key: 'skills',
      header: 'Skills',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.skills?.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-xs text-gray-800"
            >
              {skill}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Applied',
      render: (row) => row.createdAt ? format(new Date(row.createdAt), 'MMM d, yyyy') : 'Unknown',
    },
  ];

  if (loading) return <Spinner />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <input
          type="search"
          placeholder="Search candidates..."
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="text-sm text-gray-500">
          {filteredAndSortedCandidates.length} candidates
        </div>
      </div>

      <Table
        data={filteredAndSortedCandidates}
        columns={columns}
        className="h-[calc(100vh-220px)]"
        onRowClick={row => {
          if (onCandidateClick) onCandidateClick(row);
          else console.log('Candidate row clicked:', row);
        }}
        enableVirtualization={filteredAndSortedCandidates.length > 100}
      />

      {filteredAndSortedCandidates.length === 0 && (
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900">No candidates found</h3>
          <p className="text-gray-500">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
}