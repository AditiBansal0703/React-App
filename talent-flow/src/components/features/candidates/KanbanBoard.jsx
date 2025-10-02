import React, { useState, useMemo } from 'react';
import { useCandidates } from '../../../api/useCandidates';
import Spinner from '../../ui/Spinner';
import Kanban from '../../ui/Kanban';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const STAGES = [
  { id: 'applied', title: 'Applied', color: 'bg-gray-100', textColor: 'text-gray-800' },
  { id: 'screen', title: 'Screening', color: 'bg-blue-100', textColor: 'text-blue-800' },
  { id: 'tech', title: 'Technical', color: 'bg-purple-100', textColor: 'text-purple-800' },
  { id: 'offer', title: 'Offer', color: 'bg-yellow-100', textColor: 'text-yellow-800' },
  { id: 'hired', title: 'Hired', color: 'bg-green-100', textColor: 'text-green-800' },
  { id: 'rejected', title: 'Rejected', color: 'bg-red-100', textColor: 'text-red-800' }
];

export default function KanbanBoard({ jobId, onCandidateClick }) {
  const [search, setSearch] = useState('');
  const { candidates, loading, error, updateCandidateStage } = useCandidates(jobId);

  const filteredCandidates = useMemo(() => {
    if (!candidates) return [];

    let result = [...candidates];
    
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

    return result;
  }, [candidates, search]);

  const groupedCandidates = useMemo(() => {
    return STAGES.reduce((acc, stage) => {
      acc[stage.id] = filteredCandidates.filter(c => c.stage === stage.id);
      return acc;
    }, {});
  }, [filteredCandidates]);

  const handleDragEnd = async (result) => {
    const { draggableId, destination, source } = result;

    // Dropped outside a droppable
    if (!destination) return;

    // Dropped in the same location
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    // Update the candidate's stage
    const newStage = destination.droppableId;
    await updateCandidateStage(draggableId, newStage);
  };

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
          {filteredCandidates.length} candidates
        </div>
      </div>

      <div className="overflow-x-auto pb-6">
        <Kanban
          columns={STAGES.map(stage => ({
            id: stage.id,
            title: `${stage.title} (${groupedCandidates[stage.id]?.length || 0})`,
            items: groupedCandidates[stage.id] || [],
            className: stage.color
          }))}
          onDragEnd={handleDragEnd}
          renderItem={(candidate) => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white p-4 rounded-lg shadow-sm space-y-3 cursor-pointer hover:shadow-md transition-shadow duration-200"
              onClick={() => {
                if (onCandidateClick) onCandidateClick(candidate);
                else console.log('Kanban candidate clicked:', candidate);
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-600 font-medium">
                    {candidate.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-gray-900 truncate underline hover:text-blue-600">{candidate.name}</div>
                  <div className="text-sm text-gray-500 truncate">{candidate.email}</div>
                </div>
              </div>

              {candidate.skills && (
                <div className="flex flex-wrap gap-1">
                  {candidate.skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-xs text-gray-800"
                    >
                      {skill}
                    </span>
                  ))}
                  {candidate.skills.length > 3 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-xs text-gray-800">
                      +{candidate.skills.length - 3}
                    </span>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center text-sm">
                <div className="text-gray-500">
                  {candidate.experience ? `${candidate.experience}y exp` : 'Experience N/A'}
                </div>
                <div className="text-gray-500">
                  {candidate.timeline ? (
                    format(new Date(candidate.timeline[0].timestamp), 'MMM d')
                  ) : (
                    'Date N/A'
                  )}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  className="text-blue-600 hover:text-blue-800 text-xs font-medium underline"
                  onClick={e => {
                    e.stopPropagation();
                    console.log('View Profile clicked:', candidate);
                  }}
                >
                  View Profile
                </button>
                <button
                  className="text-gray-600 hover:text-gray-900 text-xs font-medium underline"
                  onClick={e => {
                    e.stopPropagation();
                    console.log('Edit clicked:', candidate);
                  }}
                >
                  Edit
                </button>
              </div>
            </motion.div>
          )}
        />
      </div>

      {filteredCandidates.length === 0 && (
        <div className="text-center py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-medium text-gray-900">No candidates found</h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </motion.div>
        </div>
      )}
    </div>
  );
}