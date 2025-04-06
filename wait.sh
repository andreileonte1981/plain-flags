mgt_id=$(docker ps -q --filter "name=plain-flags-flag-management")
echo $mgt_id
while [ -z "`docker logs $mgt_id | grep 'Flag management service listening'`" ]; do
  echo "Waiting for service to start..."
  sleep 1
done
echo "Management service is up and running."

states_id=$(docker ps -q --filter "name=plain-flags-flag-states" | head -n 1)
echo $states_id
while [ -z "`docker logs $states_id | grep 'State service listening'`" ]; do
  echo "Waiting for service to start..."
  sleep 1
done
echo "States service is up and running."
