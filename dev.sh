cd services/flag-management
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

cd dashboard
npm run dev
