echo "Taking down containers"

docker rm -f $(docker ps -a -q)

# PostgreSQL is started as containers
docker compose -f docker-compose-pg.yml up -d

cd services/flag-management

# Migrates the PG or SQLite data; it depends on which database type is configured.
npm run dev:migrate

npm run build &
npm run dev &

cd ../../

cd services/flag-states
npm run build &
npm run dev &

cd ../../

cd service-tests
npm run build &

cd ../

cd sdk/node
npm run build &

cd ../../

cd dashboard
npm run dev
