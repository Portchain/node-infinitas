SELECT
  t.name,
  t.schedule,
  t.timeout_ms,
  t.next_job_date
FROM infinitas_tasks AS t
WHERE t.next_job_date < NOW()
  AND t.enabled = TRUE
