-- $1: name
-- $2: cron schedule
-- $3: timeout
-- $4: next scheduled job time stamp
-- $5: enabled
INSERT INTO infinitas_tasks (name, schedule, timeout_ms, next_job_date, enabled)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (name) DO
  UPDATE
  SET
    schedule=EXCLUDED.schedule,
    timeout_ms=EXCLUDED.timeout_ms,
    next_job_date=EXCLUDED.next_job_date,
    enabled=EXCLUDED.enabled
