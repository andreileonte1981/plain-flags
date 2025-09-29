if [ -z "$1" ]; then
    ARG=patch
else
    ARG=$1  # minor, major
fi

cd services

cd flag-management
npm version $ARG

cd ../flag-states
npm version $ARG

cd ../../dashboard
npm version $ARG
