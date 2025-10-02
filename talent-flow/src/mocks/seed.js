import { faker } from '@faker-js/faker';
import { db } from '../config/db';

const JOB_STATUSES = ['active', 'archived'];
const CANDIDATE_STAGES = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];
const TAGS = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales'];
const QUESTION_TYPES = ['short-text', 'long-text', 'single-choice', 'multi-choice', 'numeric', 'file-upload'];

export const generateAssessmentQuestions = () => {
  return Array.from({ length: faker.number.int({ min: 3, max: 6 }) }, (_, i) => {
    const type = faker.helpers.arrayElement(QUESTION_TYPES);
    const base = {
      id: `q${i + 1}`,
      type,
      label: faker.lorem.sentence() + '?',
      required: faker.datatype.boolean(),
      description: faker.datatype.boolean() ? faker.lorem.sentence() : undefined,
    };

    switch (type) {
      case 'numeric':
        return {
          ...base,
          min: faker.number.int({ min: 0, max: 10 }),
          max: faker.number.int({ min: 11, max: 100 }),
        };
      case 'single-choice':
      case 'multi-choice':
        return {
          ...base,
          options: Array.from({ length: faker.number.int({ min: 3, max: 6 }) }, () => ({
            id: faker.string.uuid(),
            label: faker.lorem.words(3),
          })),
        };
      default:
        return base;
    }
  });
};

export const seedDatabase = async () => {
  // Generate jobs
  const jobs = Array.from({ length: 25 }, (_, i) => {
    const title = faker.person.jobTitle();
    return {
      id: faker.string.uuid(),
      title,
      slug: faker.helpers.slugify(title).toLowerCase(),
      status: faker.helpers.arrayElement(JOB_STATUSES),
      tags: faker.helpers.arrayElements(TAGS, { min: 1, max: 3 }),
      order: i,
      description: faker.lorem.paragraphs(3),
      requirements: Array.from({ length: faker.number.int({ min: 3, max: 6 }) }, () => faker.lorem.sentence()),
      location: faker.location.city(),
      salary: {
        min: faker.number.int({ min: 50000, max: 100000 }),
        max: faker.number.int({ min: 100001, max: 200000 }),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  // Add jobs to database
  const jobIds = await db.jobs.bulkAdd(jobs, { allKeys: true });

  // Generate candidates
  const candidates = Array.from({ length: 1000 }, () => {
    const jobId = faker.helpers.arrayElement(jobIds);
    const stage = faker.helpers.arrayElement(CANDIDATE_STAGES);
    const timelineLength = faker.number.int({ min: 1, max: 5 });
    
    return {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      stage,
      jobId,
      phone: faker.phone.number(),
      location: faker.location.city(),
      experience: faker.number.int({ min: 1, max: 15 }),
      skills: faker.helpers.arrayElements(TAGS, { min: 2, max: 4 }),
      timeline: Array.from({ length: timelineLength }, (_, i) => ({
        id: faker.string.uuid(),
        type: i === 0 ? 'applied' : 'status_change',
        data: i === 0 ? { resume: 'path/to/resume.pdf' } : {
          from: CANDIDATE_STAGES[i - 1],
          to: CANDIDATE_STAGES[i],
        },
        timestamp: faker.date.recent({ days: 30 - i * 5 }).toISOString(),
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  // Add candidates to database
  await db.candidates.bulkAdd(candidates);

  // Generate assessments
  const assessments = jobIds.slice(0, 3).map(jobId => ({
    id: faker.string.uuid(),
    jobId,
    title: 'Technical Assessment',
    sections: [
      {
        id: faker.string.uuid(),
        title: 'Basic Information',
        questions: generateAssessmentQuestions(),
        order: 0,
      },
      {
        id: faker.string.uuid(),
        title: 'Technical Skills',
        questions: generateAssessmentQuestions(),
        order: 1,
      },
      {
        id: faker.string.uuid(),
        title: 'Project Experience',
        questions: generateAssessmentQuestions(),
        order: 2,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  // Add assessments to database
  await db.assessments.bulkAdd(assessments);

  console.log('Database seeded successfully');
};