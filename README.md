# noteful-server

API server written wirth Express for the noteful-client from Module 16

# Setup

* Clone repo
* Install dependencies: npm install
* Create database: postgres=# create database noteful_test;
* Add entries to .env for
  - MIGRATION_DB_HOST=[hostname]
  - MIGRATION_DB_PORT=[port]
  - MIGRATION_DB_NAME=[noteful_test or noteful]
  - MIGRATION_DB_PASS=[password for DB user]
  - DB_URL="postgresql://user@server/noteful"
  - TEST_DB_URL="postgresql://user@server/notful-test"
* Run migrations: npm run migrate
* Add seed data:  psql -U [DB Owner] -d noteful_test -f ./seeds/seed.noteful-tables.sql
* 
