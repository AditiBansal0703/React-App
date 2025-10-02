import { useState, useEffect, useCallback } from 'react';

export function useAssessment(jobId) {
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch assessment for a job
  const fetchAssessment = useCallback(async () => {
    if (!jobId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/jobs/${jobId}/assessment`);
      if (response.status === 404) {
        setAssessment(null);
        return null;
      }
      if (!response.ok) {
        throw new Error('Failed to fetch assessment');
      }
      const data = await response.json();
      setAssessment(data);
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
    if (jobId) {
      fetchAssessment();
    }
  }, [jobId, fetchAssessment]);

  // Create a new assessment for a job
  const createAssessment = async (assessmentData) => {
    if (!jobId) throw new Error('Job ID is required');

    try {
      const response = await fetch(`/jobs/${jobId}/assessment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessmentData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create assessment');
      }
      
      const newAssessment = await response.json();
      setAssessment(newAssessment);
      return newAssessment;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Update an assessment
  const updateAssessment = async (updates) => {
    if (!jobId) throw new Error('Job ID is required');

    try {
      const response = await fetch(`/jobs/${jobId}/assessment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update assessment');
      }
      
      const updatedAssessment = await response.json();
      setAssessment(updatedAssessment);
      return updatedAssessment;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Delete an assessment
  const deleteAssessment = async () => {
    if (!jobId) throw new Error('Job ID is required');

    try {
      const response = await fetch(`/jobs/${jobId}/assessment`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete assessment');
      }
      
      setAssessment(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Add a section to the assessment
  const addSection = async (sectionData) => {
    if (!assessment) throw new Error('No assessment exists');
    
    const newSection = {
      id: Date.now().toString(), // Simple ID generation
      ...sectionData,
    };

    return updateAssessment({
      sections: [...assessment.sections, newSection]
    });
  };

  // Update a section in the assessment
  const updateSection = async (sectionId, updates) => {
    if (!assessment) throw new Error('No assessment exists');
    
    const sectionIndex = assessment.sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) throw new Error('Section not found');

    const newSections = [...assessment.sections];
    newSections[sectionIndex] = {
      ...newSections[sectionIndex],
      ...updates,
    };

    return updateAssessment({ sections: newSections });
  };

  // Delete a section from the assessment
  const deleteSection = async (sectionId) => {
    if (!assessment) throw new Error('No assessment exists');

    return updateAssessment({
      sections: assessment.sections.filter(s => s.id !== sectionId)
    });
  };

  // Add a question to a section
  const addQuestion = async (sectionId, questionData) => {
    if (!assessment) throw new Error('No assessment exists');
    
    const sectionIndex = assessment.sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) throw new Error('Section not found');

    const newQuestion = {
      id: Date.now().toString(), // Simple ID generation
      ...questionData,
    };

    const newSections = [...assessment.sections];
    newSections[sectionIndex] = {
      ...newSections[sectionIndex],
      questions: [...(newSections[sectionIndex].questions || []), newQuestion],
    };

    return updateAssessment({ sections: newSections });
  };

  // Update a question in a section
  const updateQuestion = async (sectionId, questionId, updates) => {
    if (!assessment) throw new Error('No assessment exists');
    
    const sectionIndex = assessment.sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) throw new Error('Section not found');

    const questionIndex = assessment.sections[sectionIndex].questions.findIndex(q => q.id === questionId);
    if (questionIndex === -1) throw new Error('Question not found');

    const newSections = [...assessment.sections];
    newSections[sectionIndex] = {
      ...newSections[sectionIndex],
      questions: [
        ...newSections[sectionIndex].questions.slice(0, questionIndex),
        {
          ...newSections[sectionIndex].questions[questionIndex],
          ...updates,
        },
        ...newSections[sectionIndex].questions.slice(questionIndex + 1),
      ],
    };

    return updateAssessment({ sections: newSections });
  };

  // Delete a question from a section
  const deleteQuestion = async (sectionId, questionId) => {
    if (!assessment) throw new Error('No assessment exists');
    
    const sectionIndex = assessment.sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) throw new Error('Section not found');

    const newSections = [...assessment.sections];
    newSections[sectionIndex] = {
      ...newSections[sectionIndex],
      questions: newSections[sectionIndex].questions.filter(q => q.id !== questionId),
    };

    return updateAssessment({ sections: newSections });
  };

  // Helper to reorder questions within or between sections
  const reorderQuestion = async (sourceSecId, sourceIndex, destSecId, destIndex) => {
    if (!assessment) throw new Error('No assessment exists');

    const newSections = [...assessment.sections];
    const sourceSection = newSections.find(s => s.id === sourceSecId);
    const destSection = newSections.find(s => s.id === destSecId);

    if (!sourceSection || !destSection) {
      throw new Error('Section not found');
    }

    const [question] = sourceSection.questions.splice(sourceIndex, 1);
    destSection.questions.splice(destIndex, 0, question);

    return updateAssessment({ sections: newSections });
  };

  // Helper to reorder sections
  const reorderSections = async (sourceIndex, destIndex) => {
    if (!assessment) throw new Error('No assessment exists');

    const newSections = [...assessment.sections];
    const [section] = newSections.splice(sourceIndex, 1);
    newSections.splice(destIndex, 0, section);

    return updateAssessment({ sections: newSections });
  };

  return {
    assessment,
    loading,
    error,
    createAssessment,
    updateAssessment,
    deleteAssessment,
    addSection,
    updateSection,
    deleteSection,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestion,
    reorderSections,
    refetch: fetchAssessment,
  };
}