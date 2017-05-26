-- $1: job id
SELECT
  j.task AS task_name,
  j.started_date,
  j.ended_date,
  j.failed,
  ARRAY_AGG(JSON_BUILD_OBJECT(
    'loggedDate', l.logged_date,
     'message', l.message
  ) ORDER BY l.logged_date ASC) AS logs
FROM infinitas_jobs AS j
LEFT JOIN infinitas_job_logs AS l ON l.job = j.id
WHERE j.id = $1
GROUP BY
  j.task,
  j.started_date,
  j.ended_date,
  j.failed

