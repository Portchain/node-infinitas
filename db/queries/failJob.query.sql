-- $1: job id
UPDATE infinitas_jobs
SET ended_date = NOW(), failed = true
WHERE id = $1
  AND ended_date IS NULL
