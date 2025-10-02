import React, { useState } from 'react';
import KanbanBoard from '../components/features/candidates/KanbanBoard';
import CandidatesTable from '../components/features/candidates/CandidatesTable';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useCandidates } from '../api/useCandidates';

export default function CandidatesPage() {
  const [viewMode, setViewMode] = useState('kanban');
  const [search, setSearch] = useState('');
  const { candidates, loading, error } = useCandidates();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Candidates</h1>
          <p className="mt-2 text-gray-600">
            Track and manage your candidate pipeline
          </p>
        </div>
        <Button 
          variant="primary"
          className="flex items-center gap-2"
          onClick={() => {/* TODO: Add candidate modal */}}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Candidate
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-sm font-medium text-gray-500">Total Candidates</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">{candidates.length}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-sm font-medium text-gray-500">In Progress</div>
          <div className="mt-2 text-3xl font-semibold text-blue-600">
            {candidates.filter(c => !['hired', 'rejected'].includes(c.stage)).length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-sm font-medium text-gray-500">Hired</div>
          <div className="mt-2 text-3xl font-semibold text-green-600">
            {candidates.filter(c => c.stage === 'hired').length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-sm font-medium text-gray-500">Rejected</div>
          <div className="mt-2 text-3xl font-semibold text-gray-600">
            {candidates.filter(c => c.stage === 'rejected').length}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <div className="flex gap-4 items-center">
          <div className="flex rounded-md shadow-sm" role="group">
            <Button
              variant={viewMode === 'kanban' ? 'primary' : 'secondary'}
              className="rounded-r-none"
              onClick={() => setViewMode('kanban')}
            >
              Kanban Board
            </Button>
            <Button
              variant={viewMode === 'table' ? 'primary' : 'secondary'}
              className="rounded-l-none"
              onClick={() => setViewMode('table')}
            >
              Table View
            </Button>
          </div>
        </div>
        <div className="w-72">
          <Input
            type="search"
            placeholder="Search candidates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {viewMode === 'kanban' ? (
          <KanbanBoard />
        ) : (
          <CandidatesTable search={search} />
        )}
      </div>
    </div>
  );
}