-- $1: task name,
-- $2: task next job scheduled date
WITH update_task AS (
  UPDATE infinitas_tasks SET next_job_date = $2 WHERE name = $1
)
INSERT INTO infinitas_jobs (task) VALUES ($1)
RETURNING id
