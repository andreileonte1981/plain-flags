echo "Taking down containers"

docker rm -f $(docker ps -a -q)

echo "Removing volumes"

docker volume prune -a -f

echo "Running services with SQLite db type"

docker compose -f docker-compose-local-sqlite.yml up -d

./wait.sh &&

cd service-tests

echo "Running tests"

REPORTFILE=report_sqlite.txt npm run report

cd ..

echo "Running services with PG db type"

docker compose -f docker-compose-local-pg.yml up -d

./wait.sh &&

cd service-tests

echo "Running tests"

REPORTFILE=report_pg.txt npm run report

cd go
echo "Running tests for go SDK..."
go test -v > ../report_go.txt

cd ../..

echo "Test summary:"
echo "SQLite:"
cat ./service-tests/report_sqlite.txt | tail -n 8
echo "PG:"
cat ./service-tests/report_pg.txt | tail -n 8
echo "go SDK:"
cat "./service-tests/report_go.txt" | tail -n 2
echo "Test reports are in service-tests"
