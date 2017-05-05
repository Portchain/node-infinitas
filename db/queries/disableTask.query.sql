-- $1: name
UPDATE infinitas_tasks SET enabled=false WHERE name = $1
