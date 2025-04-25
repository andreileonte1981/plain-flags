# Plain Flags

Basic feature flags

## Folder structure

**services** - The back end for the feature flags logic.

**services/flag-management** - The service for creating and changing feature flags. Exposes a REST API.

**services/flag-states** - The service that tells the application of interest which features are on. Exposes a REST API.

**service-tests** - A test project with an HTTP client with all the service behaviour tests.

**sdk** - Collection of SDK libraries to import in other applications for using the feature flags.

**dashboard** - The frontend app where authenticated users can create and change feature flags.

## Running as developer

There are **.env.template** files in the project's subfolders. Rename or copy each to **.env** and set the values where missing.

Run the dev script to start all components:

```bash
./dev.sh
```

### Tests

The fastest tests run a behaviour test suite on the currently running services (the services must be started either on the local host or in containers.)

In the **service-tests** folder, run the behaviour tests:

```bash
npm run test
```

For more complete tests, run the test script in the project root

```bash
./test.sh
```

This script starts the services as containers and runs the tests successively for each database type.

> **_Expected failures:_** When run as containers, the services behave as in production. Expect all tests that rely on development mode, such as the stale detection tests, to fail when testing with containers.

### Debugging

The components have launch configurations included for **Visual Studio Code**. If you use it as your IDE, you can use those configurations. See the **launch.json** files under the respective **.vscode** folders. To debug each component, open it in a separate Visual Studio code window.

By default, the dashboard web app is available at http://localhost:5173/flags when all components are running.
