import Dexie from 'dexie';

export class TalentFlowDB extends Dexie {
  constructor() {
    super('talentFlowDB');
    this.version(1).stores({
      jobs: 'id, title, slug, status, order, createdAt, updatedAt, *tags',
      candidates: 'id, name, email, stage, jobId, createdAt, updatedAt, *skills',
      assessments: 'id, jobId, title, createdAt, updatedAt',
      assessmentSections: 'id, assessmentId, title, order',
      assessmentQuestions: 'id, sectionId, type, label, required, order, *options',
      assessmentResponses: 'id, assessmentId, candidateId, createdAt, *answers',
      candidateTimeline: 'id, candidateId, type, data, timestamp, createdBy',
      candidateNotes: 'id, candidateId, content, createdAt, createdBy, *mentions'
    });
  }
}

export const db = new TalentFlowDB();

// Extend the db with typed tables
db.jobs.mapToClass(class Job {
  static validate(data) {
    if (!data.title) throw new Error('Job title is required');
    if (!data.status) throw new Error('Job status is required');
    if (!['active', 'archived'].includes(data.status)) {
      throw new Error('Invalid job status');
    }
    return true;
  }
});

db.candidates.mapToClass(class Candidate {
  static validate(data) {
    if (!data.name) throw new Error('Candidate name is required');
    if (!data.email) throw new Error('Candidate email is required');
    if (!data.stage) throw new Error('Candidate stage is required');
    if (!['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'].includes(data.stage)) {
      throw new Error('Invalid candidate stage');
    }
    return true;
  }
});

// Export constants
export const JOB_STATUSES = ['active', 'archived'];
export const CANDIDATE_STAGES = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];
export const QUESTION_TYPES = ['short-text', 'long-text', 'single-choice', 'multi-choice', 'numeric', 'file-upload'];
export const AVAILABLE_TAGS = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales'];

export default db;