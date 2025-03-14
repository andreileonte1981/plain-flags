cd services/flag-management

# Assumes data folder for development is "data"
if [ ! -d "data" ]; then
  npm run typeorm:migrate
fi

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
