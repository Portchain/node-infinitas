-- $1: jobId
-- $2: timestamp
-- $3: message
INSERT INTO infinitas_job_logs (job, logged_date, message) VALUES ($1, $2, $3)
