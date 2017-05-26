-- $1: task name
SELECT
  t.name,
  t.schedule,
  t.timeout_ms,
  t.enabled,
  t.created_date,
  t.next_job_date,
  j.list AS jobs
FROM infinitas_tasks AS t
LEFT JOIN (
  SELECT
    ARRAY_AGG(JSON_BUILD_OBJECT(
      'id', j.id,
      'startedDate', j.started_date,
      'endedDate',j.ended_date,
      'failed', j.failed
    ) ORDER BY started_date DESC) AS list
  FROM infinitas_jobs AS j
  WHERE j.task = $1
) AS j ON TRUE
WHERE t.name = $1

