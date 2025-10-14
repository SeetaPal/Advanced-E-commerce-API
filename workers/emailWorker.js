const queue = require('../utils/queue');

const processEmailJobs = async () => {
  try {
    const job = queue.dequeue('send_confirmation_email');
    if(!job) return;
    const { payload } = job;
    // In production: send actual email using mailer service
    console.log(`[EmailWorker] Sending confirmation email for order ${payload.orderId} to user ${payload.userId}`);
    // simulate delay
    await new Promise(r => setTimeout(r, 500));
    queue.complete(job.id);
  } catch(err){
    console.error('Email worker error', err);
  }
};

// run periodically
setInterval(processEmailJobs, 2000);
module.exports = { processEmailJobs };
