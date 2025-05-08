# Plain Flags Go SDK

This module facilitates your software's connection to the Plain Flags feature flag system.

## Requirements

You must host an installation of the Plain Flags feature flag back end services.

More about Plain Flags at [plainflags.dev](https://plainflags.dev)

The Plain Flags back end must run in an environment where your software can make http requests.

## Installation

```
go get github.com/andreileonte1981/plain-flags/sdk/go
```

## Usage

Import the Plain Flags SDK package:

```go
import (
	plainflags "github.com/andreileonte1981/plain-flags/sdk/go"
)
```

Create and configure an object of type PlainFlags at the start of your software's execution:

```go
    featureFlags := plainflags.NewPlainFlags(plainflags.PlainFlagsConfig{
        ServiceUrl:   "http://my-plainflags-states.dev",
        Timeout:      time.Second * 20,
        ApiKey:       "mySharedSecret",
        PollInterval: 0,
    },
    myInfoFunction,  // nil to mute info logs
    myErrorFunction) // nil to mute error logs
```

Initialize the object:

```go
    initialized := make(chan plainflags.DoneResult)

    go featureFlags.Init(initialized)

    r := <-initialized
```

Any feature code you wish to enable and disable with feature flags will be within conditions like this:

```go
if featureFlags.IsOn(flagName, false, nil) {
  // your feature code here
}
```

If your features are constrained to subsets of your users, you must specify which user is currently using the software (and other context you constrain your feature for, if applicable).

```go
if featureFlags.IsOn(flagName, false, &map[string]string{
    "userId": currentUser().id,
    "countryCode": currentCountryCode(),
}) {
   // Include your code for your feature
}
```

The keys **userId** and **countryCode** must match the constraint keys you created in the dashboard

## Source code

[github link](https://github.com/andreileonte1981/plain-flags/tree/main/sdk/go)
