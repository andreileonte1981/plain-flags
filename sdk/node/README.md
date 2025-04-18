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

Import the Plain Flags SDK library:

```typescript
import PlainFlags from "plain-flags-node-sdk";
```

Create and configure an object of type PlainFlags at the start of your software's execution:

```typescript
const plainFlags = new PlainFlags(
  {
    policy: "poll", // Poll policy; you can also choose "manual"
    pollInterval: 1000, // Will update feature flag state at this interval
    serviceUrl: "http://my-url.dev", // Depends on where you host
    apiKey: "mySharedSecret", // Must be the same as the one configured on the back end
  },

  /**
   * Pass null as either of these to mute logging.
   * If omitted, logs to console.
   */
  myInfoLogFunction,
  myErrorLogFunction
);
```

Initialize the object:

```typescript
await plainFlags.init();
```

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

## Source code

[github link](https://github.com/andreileonte1981/plain-flags/tree/main/sdk/node)
