# Plain Flags NodeJS SDK

This library facilitates your software's connection to the Plain Flags feature flag system.

## Requirements

You must host an installation of the Plain Flags feature flag back end services.

More about Plain Flags at [plainflags.dev](https://plainflags.dev)

The Plain Flags back end must run in an environment where your software can make http requests.

## Installation

```
npm install plain-flags-node-sdk
```

## Usage

### Import the library

```typescript
import PlainFlags from "plain-flags-node-sdk";
```

### Create and configure an object of type PlainFlags at the start of your software's execution:

```typescript
const plainFlags = new PlainFlags(
  {
    policy: "poll", // Poll policy; you can also choose "manual"
    pollInterval: 1000, // Will update feature flag state at this interval
    serviceUrl: "http://my-url.dev", // Depends on where you host
    apiKey: "mySharedSecret", // Must be the same as the one configured on the back end
    logStateUpdatesOnPoll: false,
  },

  /**
   * Pass null as either of these to mute logging.
   * If omitted, logs to console.
   */
  myInfoLogFunction,
  myErrorLogFunction
);
```

### Initialize the object:

```typescript
await plainFlags.init();
```

### Run your code conditionally

Any feature code you wish to enable and disable with feature flags will be within conditions like this:

```typescript
if (plainFlags.isOn("My feature name")) {
  /* your feature code here */
}
```

If your features are constrained to subsets of your users, you must specify which user is currently using the software.

```typescript
if (
  plainFlags.isOn(
    /**
     * You choose the name of your feature
     * and create a flag in the front end of Plain Flags
     * with the same name.
     */
    "My feature name",
    /**
     * Default value, false if omitted.
     */
    undefined,
    {
      userId: userService.getCurrentUser().id,
      countryCode: regionService.getCountryCode(),
    }
  )
) {
  /**
   * Include your code for your feature
   */
}
```

The **userService** and **regionService** objects in the code above are fictitious examples of how your app can know who is using it and where.

The keys **userId** and **countryCode** must match the constraint keys you created in the dashboard

### Set your log callbacks separately

If your log functions are unavailable at the time you construct the PlainFlags object, then you can set the callbacks for logs and errors later:

```typescript
plainFlags.setLogCallback((...args: any) =>
  server.log.info(args[0], ...args.slice(1))
);
plainFlags.setErrorCallback((...args: any) =>
  server.log.error(args[0], ...args.slice(1))
);
```

### Obtain all flag states directly from the SDK and set them

Supposing you have a client-server application, you want your server to handle the updating of feature flag states, not your client. This lets you control access to your PlainFlags services more securely.

Your client can then obtain the state from your server and set it directly in the client-side SDK as follows:

```Typescript
// Server side:

// Ask the SDK what the flag states are
const flagStates = plainFlags.getCurrentStates()

// Make this data available to your client, for example via a REST HTTP endpoint
```

```Typescript
// Client side:

// Obtain the plain flag data from your server, for example with an HTTP GET request to a secure endpoint

// Tell the client-side SDK that you want to use that flag state collection:

plainFlags.setCurrentStates(flagStateData)

// Use the feature flags as documented above:
if(plainFlags.isOn(
  "My feature",
  undefined,
  /* Pass constraints optionally */
  {}
)) {
  // Run conditional client code
}
```

## Source code

[github link](https://github.com/andreileonte1981/plain-flags/tree/main/sdk/node)
