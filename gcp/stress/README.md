Stress tests.

These run locally against the cloud-deployed states service.
They work with the services deployed with shell scripts, not with terraform deployed services (those have -tf suffixes)

example:

Run state updates with concurrency of 2000

```bash
./stress.sh 2000
```

Read the stress.sh script for more details.
