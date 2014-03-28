
db-create:
	psql --single-transaction --user postgres -d isight -f ./script/create-db.sql

db-clean:
	psql --single-transaction --user=postgres -d isight -f ./script/clean-db.sql

doc:
	node_modules/.bin/apidoc -i lib/ -o doc/

.PHONY: db-create db-clean doc

