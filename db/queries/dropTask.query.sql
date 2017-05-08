WITH delete_logs AS (
  DELETE FROM infinitas_job_logs AS l
  USING infinitas_jobs AS j,
    infinitas_tasks AS t
  WHERE t.name = j.task
    AND j.id = l.job
    AND t.name = $1
), delete_jobs AS (
  DELETE FROM infinitas_jobs AS j
  USING infinitas_tasks AS t
  WHERE t.name = j.task
  AND t.name = $1
)
DELETE FROM infinitas_tasks WHERE name = $1
