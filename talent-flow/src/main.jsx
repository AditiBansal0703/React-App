// src/main.jsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter } from 'react-router-dom';
import Dexie from 'dexie';
import App from './App.jsx';
import './index.css';
import { db } from './config/db';
import { seedDatabase } from './mocks/seed';

// Create a client with default settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

function AppWrapper() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function initializeApp() {
      try {
        // Start MSW first if in development
        if (process.env.NODE_ENV === 'development') {
          const { worker } = await import('./mocks/browser.js');
          await worker.start({ onUnhandledRequest: 'bypass' });
          console.log('MSW worker started successfully');
        }

        // Delete existing database to avoid version conflicts
        await Dexie.delete('talentFlowDB');
        
        // Initialize IndexedDB
        await db.open();
        
        // Only seed if in development and database is empty
        if (process.env.NODE_ENV === 'development') {
          try {
            const jobCount = await db.jobs.count();
            if (jobCount === 0) {
              await seedDatabase();
              console.log('Database seeded successfully');
            }
          } catch (err) {
            console.warn('Error checking/seeding database:', err);
            // Continue even if seeding fails
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Initialization error:', err);
        setError(err.message || 'Failed to initialize application');
        setIsLoading(false);
      }
    }

    initializeApp();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </React.StrictMode>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AppWrapper />);