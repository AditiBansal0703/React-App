import { useState, useEffect, useCallback } from 'react';

export function useCandidates(jobId) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch candidates, optionally filtered by jobId
  const fetchCandidates = useCallback(async () => {
    try {
      setLoading(true);
      const url = jobId ? `/candidates/job/${jobId}` : '/candidates';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch candidates');
      }
      const data = await response.json();
      setCandidates(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  // Initial fetch
  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  // Get a single candidate by ID
  const getCandidate = async (id) => {
    try {
      const response = await fetch(`/candidates/${id}`);
      if (!response.ok) {
        throw new Error('Candidate not found');
      }
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Create a new candidate
  const createCandidate = async (candidateData) => {
    try {
      const response = await fetch('/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candidateData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create candidate');
      }
      
      const newCandidate = await response.json();
      if (!jobId || newCandidate.jobId === jobId) {
        setCandidates(prev => [...prev, newCandidate]);
      }
      return newCandidate;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Update a candidate's information
  const updateCandidate = async (id, updates) => {
    try {
      const response = await fetch(`/candidates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update candidate');
      }
      
      const updatedCandidate = await response.json();
      setCandidates(prev => {
        // If filtering by jobId and candidate moved to different job, remove them
        if (jobId && updatedCandidate.jobId !== jobId) {
          return prev.filter(c => c.id !== id);
        }
        // Otherwise update them in the list
        return prev.map(c => c.id === id ? updatedCandidate : c);
      });
      return updatedCandidate;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Delete a candidate
  const deleteCandidate = async (id) => {
    try {
      const response = await fetch(`/candidates/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete candidate');
      }
      
      setCandidates(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Update a candidate's stage
  const updateCandidateStage = async (id, newStage) => {
    return updateCandidate(id, { stage: newStage });
  };

  return {
    candidates,
    loading,
    error,
    getCandidate,
    createCandidate,
    updateCandidate,
    deleteCandidate,
    updateCandidateStage,
    refetch: fetchCandidates,
  };
}