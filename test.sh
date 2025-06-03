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

cd sdks
cd go
echo "Running tests for go SDK..."
go test -v > ../../report_go.txt

cd ..
cd python
echo "Running tests for python SDK..."
./test.sh ../../report_python.txt

cd ../../..

echo "============================"
echo "Test summary:"
echo ""
echo "SQLite:"
cat ./service-tests/report_sqlite.txt | tail -n 8
echo ""
echo "PG:"
cat ./service-tests/report_pg.txt | tail -n 8
echo ""
echo "go SDK:"
cat "./service-tests/report_go.txt" | tail -n 2
echo ""
echo "python SDK:"
cat "./service-tests/report_python.txt" | tail -n 1 | tr -d "="
echo ""
echo "Test reports are in service-tests"
