CREATE DATABASE infinitas;
CREATE USER infinitas WITH PASSWORD 'infinitas';
GRANT ALL PRIVILEGES ON DATABASE infinitas TO infinitas;
-- don't forget to edit your pg_hba.conf file with the following:
-- # TYPE  DATABASE        USER            ADDRESS                 METHOD
-- host    infinitas       infinitas       127.0.0.1/32            md5
