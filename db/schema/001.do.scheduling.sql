
CREATE TABLE infinitas_tasks (
  name CHARACTER VARYING PRIMARY KEY,
  schedule CHARACTER VARYING NOT NULL,
  timeout_ms INT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  next_job_date TIMESTAMP WITH TIME ZONE NOT NULL
);
CREATE INDEX infinitas_tasks_next_job_date_index ON infinitas_tasks(next_job_date DESC NULLS LAST);

CREATE TABLE infinitas_jobs (
  id SERIAL PRIMARY KEY,
  task CHARACTER VARYING NOT NULL REFERENCES infinitas_tasks,
  started_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ended_date TIMESTAMP WITH TIME ZONE,
  failed BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX infinitas_jobs_task_index ON infinitas_jobs(task);
CREATE INDEX infinitas_jobs_date_started_index ON infinitas_jobs(started_date DESC);
CREATE INDEX infinitas_jobs_date_ended_index ON infinitas_jobs(ended_date DESC NULLS FIRST);

CREATE TABLE infinitas_job_logs (
  job SERIAL NOT NULL REFERENCES infinitas_jobs,
  logged_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  message TEXT NOT NULL
);
