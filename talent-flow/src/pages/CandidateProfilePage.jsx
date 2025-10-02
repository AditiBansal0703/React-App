import React from 'react';
import { useParams } from 'react-router-dom';

export default function CandidateProfilePage() {
  const { candidateId } = useParams();

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-4">Candidate Profile: {candidateId}</h1>
      <p className="text-slate-600">
        Display candidate details and a timeline of their status changes. [cite: 17]
      </p>
    </div>
  );
}