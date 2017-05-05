-- $1: job id
UPDATE infinitas_jobs
SET ended_date = NOW()
WHERE id = $1
  AND ended_date IS NULL
