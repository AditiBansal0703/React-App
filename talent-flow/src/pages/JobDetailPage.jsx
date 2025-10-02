import React from 'react';
import { useParams } from 'react-router-dom';

export default function JobDetailPage() {
  const { jobId } = useParams();

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-4">Job Detail: {jobId}</h1>
      <p className="text-slate-600">
        This page will show details for a specific job, and will also host the Assessment Builder. [cite: 22]
      </p>
    </div>
  );
}