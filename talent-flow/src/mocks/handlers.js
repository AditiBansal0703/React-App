// src/mocks/handlers.js
import { http, HttpResponse, delay } from 'msw';
import { faker } from '@faker-js/faker';
import { db, JOB_STATUSES, CANDIDATE_STAGES } from '../config/db';

// API Configuration
const API_CONFIG = {
  delay: {
    min: 200,
    max: 1200,
  },
  errorRate: 0.1, // 10% error rate for write operations
};

// Utility functions for API behavior
const utils = {
  addDelay: () => delay(faker.number.int(API_CONFIG.delay)),
  simulateFailure: () => Math.random() < API_CONFIG.errorRate,
  parseQueryParams: (url) => {
    const searchParams = new URL(url).searchParams;
    return {
      search: searchParams.get('search') || '',
      status: searchParams.get('status'),
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '10'),
      sort: searchParams.get('sort'),
      stage: searchParams.get('stage'),
    };
  },
  handleError: (error) => {
    console.error('API Error:', error);
    return new HttpResponse(
      JSON.stringify({ error: error.message || 'Internal server error' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

export const handlers = [
  // Jobs API
  http.get('/jobs', async ({ request }) => {
    await utils.addDelay();
    try {
      const { search, status, page, pageSize, sort } = utils.parseQueryParams(request.url);
      
      // Get all jobs and filter
      let jobs = await db.jobs.toArray();
      
      // Apply filters
      if (search) {
        const searchLower = search.toLowerCase();
        jobs = jobs.filter(job => 
          job.title.toLowerCase().includes(searchLower) ||
          job.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
      
      if (status && JOB_STATUSES.includes(status)) {
        jobs = jobs.filter(job => job.status === status);
      }
      
      // Apply sorting
      if (sort) {
        jobs.sort((a, b) => {
          if (sort === 'title') return a.title.localeCompare(b.title);
          if (sort === '-title') return b.title.localeCompare(a.title);
          if (sort === 'order') return a.order - b.order;
          return 0;
        });
      }
      
      // Apply pagination
      const total = jobs.length;
      const paginatedJobs = jobs.slice((page - 1) * pageSize, page * pageSize);
      
      return HttpResponse.json({
        jobs: paginatedJobs,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      });
    } catch (error) {
      return utils.handleError(error);
    }
  }),

  http.post('/jobs', async ({ request }) => {
    await utils.addDelay();
    
    if (utils.simulateFailure()) {
      return new HttpResponse('Internal Server Error', { status: 500 });
    }
    
    try {
      const data = await request.json();
      
      const newJob = {
        id: faker.string.uuid(),
        ...data,
        slug: faker.helpers.slugify(data.title).toLowerCase(),
        order: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await db.jobs.add(newJob);
      return HttpResponse.json(newJob, { status: 201 });
    } catch (error) {
      return utils.handleError(error);
    }
  }),

  http.patch('/jobs/:id', async ({ params, request }) => {
    await utils.addDelay();
    
    if (utils.simulateFailure()) {
      return new HttpResponse('Internal Server Error', { status: 500 });
    }
    
    try {
      const { id } = params;
      const updates = await request.json();
      
      const job = await db.jobs.get(id);
      if (!job) {
        return new HttpResponse('Job not found', { status: 404 });
      }
      
      const updatedJob = {
        ...job,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await db.jobs.put(updatedJob);
      
      return HttpResponse.json(updatedJob);
    } catch (error) {
      return utils.handleError(error);
    }
  }),

  http.delete('/jobs/:id', async ({ params }) => {
    await utils.addDelay();

    if (utils.simulateFailure()) {
      return new HttpResponse('Internal Server Error', { status: 500 });
    }

    try {
      const { id } = params;
      await db.jobs.delete(id);
      return new HttpResponse(null, { status: 204 });
    } catch (error) {
      return utils.handleError(error);
    }
  }),

  // Candidates API
  http.get('/candidates', async ({ request }) => {
    await utils.addDelay();
    try {
      const { search, stage, page, pageSize } = utils.parseQueryParams(request.url);
      
      let candidates = await db.candidates.toArray();
      
      if (search) {
        const searchLower = search.toLowerCase();
        candidates = candidates.filter(candidate =>
          candidate.name.toLowerCase().includes(searchLower) ||
          candidate.email.toLowerCase().includes(searchLower)
        );
      }
      
      if (stage && CANDIDATE_STAGES.includes(stage)) {
        candidates = candidates.filter(candidate => candidate.stage === stage);
      }
      
      const total = candidates.length;
      const paginatedCandidates = candidates.slice((page - 1) * pageSize, page * pageSize);
      
      return HttpResponse.json({
        candidates: paginatedCandidates,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      });
    } catch (error) {
      return utils.handleError(error);
    }
  }),

  http.get('/candidates/:id', async ({ params }) => {
    await utils.addDelay();
    try {
      const { id } = params;
      const candidate = await db.candidates.get(id);
      
      if (!candidate) {
        return new HttpResponse('Candidate not found', { status: 404 });
      }
      
      return HttpResponse.json(candidate);
    } catch (error) {
      return utils.handleError(error);
    }
  }),

  http.get('/candidates/:id/timeline', async ({ params }) => {
    await utils.addDelay();
    try {
      const { id } = params;
      const candidate = await db.candidates.get(id);
      
      if (!candidate) {
        return new HttpResponse('Candidate not found', { status: 404 });
      }
      
      return HttpResponse.json(candidate.timeline || []);
    } catch (error) {
      return utils.handleError(error);
    }
  }),

  // Assessments API
  http.get('/assessments/:jobId', async ({ params }) => {
    await utils.addDelay();
    try {
      const { jobId } = params;
      const assessment = await db.assessments
        .where('jobId')
        .equals(jobId)
        .first();
      
      if (!assessment) {
        return new HttpResponse('Assessment not found', { status: 404 });
      }
      
      return HttpResponse.json(assessment);
    } catch (error) {
      return utils.handleError(error);
    }
  }),

  http.put('/assessments/:jobId', async ({ params, request }) => {
    await utils.addDelay();
    
    if (utils.simulateFailure()) {
      return new HttpResponse('Internal Server Error', { status: 500 });
    }
    
    try {
      const { jobId } = params;
      const data = await request.json();
      
      const assessment = {
        ...data,
        jobId,
        updatedAt: new Date().toISOString()
      };
      
      await db.assessments.put(assessment);
      
      return HttpResponse.json(assessment);
    } catch (error) {
      return utils.handleError(error);
    }
  })
];