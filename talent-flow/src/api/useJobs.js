import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '../config/db';

export function useJobs() {
  const queryClient = useQueryClient();

  // Use React Query for fetching jobs
  const { data: jobs, isLoading, error, refetch } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      try {
        console.log('Fetching jobs...');
        // First try direct database access
        let jobs = await db.jobs.toArray();
        console.log('Jobs from DB:', jobs);

        if (!jobs || jobs.length === 0) {
          console.log('No jobs in DB, fetching from API...');
          const response = await fetch('/jobs');
          if (!response.ok) {
            throw new Error(`Failed to fetch jobs: ${response.statusText}`);
          }
          jobs = await response.json();
          console.log('Jobs from API:', jobs);
        }

        return jobs;
      } catch (err) {
        console.error('Error in useJobs:', err);
        throw new Error(`Failed to fetch jobs: ${err.message}`);
      }
    },
    retry: 2,
    staleTime: 1000 * 60, // 1 minute
  });

  // Add mutation for creating jobs
  const createJob = useMutation({
    mutationFn: async (newJob) => {
      console.log('Creating new job:', newJob);
      const response = await fetch('/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newJob),
      });
      if (!response.ok) {
        throw new Error('Failed to create job');
      }
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Job created successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onError: (error) => {
      console.error('Error creating job:', error);
    }
  });

  // Add mutation for updating jobs
  const updateJob = useMutation({
    mutationFn: async ({ id, ...updates }) => {
      console.log('Updating job:', id, updates);
      const response = await fetch(`/jobs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error('Failed to update job');
      }
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Job updated successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onError: (error) => {
      console.error('Error updating job:', error);
    }
  });

  // Log current state
  console.log('useJobs hook state:', {
    jobCount: jobs?.length ?? 0,
    isLoading,
    hasError: !!error
  });

  return {
    jobs,
    loading: isLoading,
    error,
    refetch,
    createJob,
    updateJob,
  };
}