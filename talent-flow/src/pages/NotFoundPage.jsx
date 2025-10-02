import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="text-center">
      <h1 className="text-6xl font-bold text-slate-800">404</h1>
      <p className="text-slate-600 mt-4 text-xl">Page Not Found</p>
      <Link to="/" className="mt-6 inline-block bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700">
        Go Home
      </Link>
    </div>
  );
}