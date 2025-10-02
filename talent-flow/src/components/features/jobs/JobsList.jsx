import React, { useState, useMemo } from 'react';
import { useJobs } from '../../../api/useJobs';
import JobCard from './JobCard';
import Spinner from '../../ui/Spinner';
import Input from '../../ui/Input';
import Button from '../../ui/Button';

export default function JobsList() {
  const { jobs, loading, error } = useJobs();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);

  // Get unique tags from all jobs
  const allTags = useMemo(() => {
    if (!jobs) return [];
    const tags = new Set();
    jobs.forEach(job => job.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags);
  }, [jobs]);

  // Filter jobs based on search, status, and tags
  const filteredJobs = useMemo(() => {
    if (!jobs) return [];
    return jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => job.tags.includes(tag));
      return matchesSearch && matchesStatus && matchesTags;
    });
  }, [jobs, search, statusFilter, selectedTags]);

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-500">
        <h3 className="text-lg font-medium">Error loading jobs</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {/* Tags filter */}
        <div className="flex flex-wrap gap-2">
          {allTags.map(tag => (
            <Button
              key={tag}
              variant={selectedTags.includes(tag) ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => {
                setSelectedTags(prev =>
                  prev.includes(tag)
                    ? prev.filter(t => t !== tag)
                    : [...prev, tag]
                );
              }}
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJobs.map(job => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      {/* Empty State */}
      {filteredJobs.length === 0 && (
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900">No jobs found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}