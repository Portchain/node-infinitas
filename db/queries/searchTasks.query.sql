SELECT
  t.name,
  t.schedule,
  t.timeout_ms,
  t.enabled,
  t.created_date,
  t.next_job_date,
  last_job.id AS last_job_id,
  last_job.started_date AS last_job_started_date,
  last_job.ended_date AS last_job_ended_date,
  last_job.failed AS last_job_failed,
  last_job.job_count AS job_count
FROM infinitas_tasks AS t
LEFT JOIN (
  SELECT
    j.id,
    j.task,
    j.started_date,
    j.ended_date,
    j.failed,
    last_job.job_count
  FROM infinitas_jobs AS j
  INNER JOIN (
    SELECT
      j.task,
      MAX(j.started_date) AS started_date,
      COUNT(*) AS job_count
    FROM infinitas_jobs AS j
    GROUP BY j.task
  ) AS last_job ON last_job.task = j.task AND last_job.started_date = j.started_date
) AS last_job ON last_job.task = t.name
ORDER BY t.name ASC
