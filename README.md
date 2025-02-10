# plain-flags

Basic feature flags

**Folder structure**

**services** - The backend for the feature flags logic. Exposes a REST API.

**services/flag-management** - The service for creating and changing feature flags

**services/flag-states** - The service that tells the application of interest which features are on

**service-tests** - A test project with an HTTP client with all the service behaviour tests. Tests are over I/O.

**sdk** - Collection of SDK libraries to import in other applications for using the feature flags.

**dashboard** - The frontend app where an authorized user can create and change feature flags.
