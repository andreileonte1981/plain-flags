# Plain Flags Dart SDK

This package facilitates your software's connection to and usage of the Plain Flags feature flag system.

## Requirements

You must host an installation of the Plain Flags feature flag back end services.

More about Plain Flags at [plainflags.dev](https://plainflags.dev)

The Plain Flags back end must run in an environment where your software can make http requests.

## Instalation

```
dart pub add plain_flags
```

## Usage

### Import the package

```dart
import 'package:plain_flags/plain_flags.dart';
```

### Create and configure an object of type PlainFlags at the start of your software's execution:

```dart
final featureFlags = PlainFlags(
    config: PlainFlagsConfig(
        serviceUrl: 'https://flags.mydomain.com',   // Where you access the states service
        apiKey: 'my_shared_secret',    // Must be the same as the one configured on the back end
        pollInterval: Duration(seconds: 0), // 0 for manual updates only
    ),
    infoCallback: myInfoLogFunction,    // null to mute (default print)
    errorCallback: myErrorLogFunction,  // null to mute (default print)
);
```

### Initialize the object:

```dart
await featureFlags.init();
```

### Run your code conditionally

Any feature code you wish to enable and disable with feature flags will be within conditions like this:

```dart
if(featureFlags.isOn("My feature name", false, {})) {
    // Code for your feature here
}
```

If your features are constrained to subsets of your users, you must specify which user is currently using the software.

```dart
if(featureFlags.isOn("My feature name", false, {
    'userId': UserService.currentUser().id,
    'countryCode': RegionService.countryCode()
})) {
    // Code for your feature here
}
```

The **UserService** and **RegionService** objects in the code above are fictitious examples of how your app can know who is using it and where.

The keys **userId** and **countryCode** must match the constraint keys you created in the dashboard

### Set your log callbacks separately

If your log functions are unavailable at the time you construct the PlainFlags object, then you can set the callbacks for logs and errors later:

```dart
featureFlags.setInfoCallback(myInfoLogFunction);
featureFlags.setErrorCallback(myErrorLogFunction);
```

### Obtain all flag states directly from the SDK and set them

Supposing you have a client-server application, you want your server to handle the updating of feature flag states, not your client. This lets you control access to your PlainFlags services more securely.

Your client can then obtain the state from your server and set it directly in the client-side SDK as follows:

```dart
// Server side:

// Ask the SDK what the flag states are
final flagStates = featureFlags.getCurrentStates();

// Make this data available to your client, for example via a REST HTTP endpoint.
```

```dart
// Client side:

// Obtain the plain flag data from your server, for example with an HTTP GET request to a secure endpoint

// Tell the client-side SDK that you want to use that flag state collection:

featureFlags.setCurrentStates(flagStateData);

// Use the feature flags as documented above:
if(featureFlags.isOn("My feature name", false, {})) {
    // Code for your feature here
}
```

## Source code

[github link](https://github.com/andreileonte1981/plain-flags/tree/main/sdk/dart)
