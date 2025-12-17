docker context use default &&

docker compose -f docker-compose-pg.yml down 'db' &&

docker volume rm plain-flags_pgdata &&
rm -rf ./data &&

docker compose -f docker-compose-pg.yml up -d 'db'