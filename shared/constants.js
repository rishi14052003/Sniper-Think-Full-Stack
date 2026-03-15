// Shared constants for frontend and backend

export const API_ENDPOINTS = {
  INTEREST: '/api/interest',
  UPLOAD: '/api/upload',
  JOB_STATUS: '/api/job/:jobId',
  RESULT: '/api/result/:jobId'
};

export const JOB_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

export const FILE_TYPES = {
  PDF: 'application/pdf',
  TXT: 'text/plain'
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const QUEUE_NAMES = {
  FILE_PROCESSING: 'file-processing'
};

export const DATABASE_TABLES = {
  USERS: 'users',
  FILES: 'files',
  JOBS: 'jobs',
  RESULTS: 'results'
};
