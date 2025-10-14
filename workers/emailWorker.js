const queue = require('../utils/queue');

const processEmailJobs = async () => {
  try {
    const job = queue.dequeue('send_confirmation_email');
    if(!job) return;
    const { payload } = job;
    console.log(`[EmailWorker] Sending confirmation email for order ${payload.orderId} to user ${payload.userId}`);
    await new Promise(r => setTimeout(r, 500));
    queue.complete(job.id);
  } catch(err){
    console.error('Email worker error', err);
  }
};

setInterval(processEmailJobs, 2000);
module.exports = { processEmailJobs };
