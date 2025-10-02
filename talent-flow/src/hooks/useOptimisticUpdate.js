import { useState, useCallback } from 'react';

/**
 * A hook for handling optimistic updates with automatic rollback on error
 * @param {Function} updateFn - Async function that performs the actual update
 * @param {Function} getOptimisticState - Function that returns the optimistic state update
 * @param {Function} setData - Function to update the data state
 * @returns {[Function, boolean]} - Update function and loading state
 */
export function useOptimisticUpdate(updateFn, getOptimisticState, setData) {
  const [isPending, setIsPending] = useState(false);

  const performUpdate = useCallback(async (updates) => {
    // Store the previous state for rollback
    let previousState = null;
    
    setIsPending(true);
    try {
      // Get current state through callback
      setData(currentState => {
        previousState = currentState;
        return getOptimisticState(updates);
      });

      // Perform the actual update
      const result = await updateFn(updates);

      // Update with the actual server response
      setData(result);
      
      return result;
    } catch (error) {
      // Rollback to previous state on error
      if (previousState !== null) {
        setData(previousState);
      }
      throw error;
    } finally {
      setIsPending(false);
    }
  }, [updateFn, getOptimisticState, setData]);

  return [performUpdate, isPending];
}
