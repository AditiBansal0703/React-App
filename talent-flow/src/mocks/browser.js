import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Create the worker instance
export const worker = setupWorker(...handlers);

// Log any worker errors
worker.events.on('request:start', ({ request }) => {
  console.log('MSW intercepted:', request.method, request.url);
});

worker.events.on('request:fail', ({ request, error }) => {
  console.error('MSW request failed:', request.method, request.url, error);
});