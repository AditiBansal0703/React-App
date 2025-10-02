import React, { useState, useEffect } from 'react';
import JobsList from '../components/features/jobs/JobsList';
import Button from '../components/ui/Button';
import JobFormModal from '../components/features/jobs/JobFormModal';
import { useJobs } from '../api/useJobs';

export default function JobsBoardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { jobs = [], loading, error, refetch } = useJobs();

  // Debug logging
  useEffect(() => {
    console.log('JobsBoardPage state:', {
      jobCount: jobs?.length ?? 0,
      loading,
      error: error?.message
    });
  }, [jobs, loading, error]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    refetch();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading jobs...</p>
          <p className="text-sm text-gray-400 mt-2">Please wait while we fetch the data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-center">
        <h3 className="text-lg font-medium text-red-800 mb-2">Error loading jobs</h3>
        <p className="text-red-600">{error.message || 'An unexpected error occurred'}</p>
        <div className="mt-2 text-sm text-red-500">
          <pre className="text-left p-2 bg-red-100 rounded">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Calculate stats from actual jobs data
  const stats = {
    activeJobs: jobs?.filter(job => job.status === 'active').length || 0,
    totalApplications: 0, // This would need to come from a separate API endpoint or job data
    hiredThisMonth: 0, // This would need to come from a separate API endpoint
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Jobs Board</h1>
        <Button 
          onClick={() => setIsModalOpen(true)}
          variant="primary"
          className="flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Post New Job
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-sm font-medium text-gray-500">Active Jobs</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.activeJobs}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-sm font-medium text-gray-500">Total Applications</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.totalApplications}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-sm font-medium text-gray-500">Hired This Month</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.hiredThisMonth}</div>
        </div>
      </div>

      {/* Jobs List */}
      <JobsList />

      {/* New Job Modal */}
      <JobFormModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
}