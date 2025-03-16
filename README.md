# Plain Flags

Basic feature flags

## Folder structure

**services** - The backend for the feature flags logic. Exposes a REST API.

**services/flag-management** - The service for creating and changing feature flags

**services/flag-states** - The service that tells the application of interest which features are on

**service-tests** - A test project with an HTTP client with all the service behaviour tests. Tests are over I/O.

**sdk** - Collection of SDK libraries to import in other applications for using the feature flags.

**dashboard** - The frontend app where authenticated users can create and change feature flags.

## Running as developer

There are **.env.template** files in the project's subfolders. Rename or copy each to **.env** and set the values where missing.

Run the dev script to start all components:

```bash
./dev.sh
```

In the **service-tests** folder, run the behaviour tests:

```bash
npm run test
```

The components have launch configurations included for **Visual Studio Code**. If you use it as your IDE, you can use those configurations. See the **launch.json** files under the respective **.vscode** folders. To debug each component, open it in a separate Visual Studio code window.

By default, the dashboard web app is available at http://localhost:5173/flags when all components are running.
