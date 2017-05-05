-- $1: name
-- $2: cron schedule
-- $3: timeout
-- $3: next scheduled job time stamp
INSERT INTO infinitas_tasks (name, schedule, timeout_ms, next_job_date)
VALUES ($1, $2, $3, $4)
