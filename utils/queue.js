const { v4: uuidv4 } = require('uuid');

class InMemoryQueue {
  constructor() {
    this.jobs = [];
  }

  enqueue(type, payload) {
    const job = { id: uuidv4(), type, payload, createdAt: new Date(), status: 'queued' };
    this.jobs.push(job);
    return job;
  }

  dequeue(type = null) {
    const idx = this.jobs.findIndex(j => j.status === 'queued' && (type ? j.type === type : true));
    if(idx === -1) return null;
    const job = this.jobs[idx];
    job.status = 'processing';
    return job;
  }

  complete(jobId) {
    const j = this.jobs.find(x => x.id === jobId);
    if(j) j.status = 'done';
  }
}

module.exports = new InMemoryQueue();
