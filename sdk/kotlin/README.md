# Plain Flags Kotlin SDK

This module facilitates your software's connection to the Plain Flags feature flag system.

## Requirements

You must host an installation of the Plain Flags feature flag back end services.

More about Plain Flags at [plainflags.dev](https://plainflags.dev)

The Plain Flags back end must run in an environment where your software can make http requests.

## Status

This is a first, minimal release. It only supports manually fetching flag state (no
constraint evaluation, no polling). Those will be added in a later release.

## Installation

Add to your Gradle build (`build.gradle.kts`):

```kotlin
dependencies {
    implementation("io.github.andreileonte1981:plain-flags-kotlin-sdk-jvm:1.0.0")
}
```

## Usage

### Import the Plain Flags SDK package:

```kotlin
import dev.plainflags.PlainFlags
import dev.plainflags.PlainFlagsConfig
```

### Create and configure an object of type PlainFlags at the start of your software's execution:

```kotlin
val featureFlags = PlainFlags(
    config = PlainFlagsConfig(
        serviceUrl = "https://flags.mydomain.com", // Where you access the states service
        apiKey = "my_shared_secret",                // Must be the same as the one configured on the back end
    ),
    infoCallback = ::myInfoLogFunction,   // null to mute (default println)
    errorCallback = ::myErrorLogFunction, // null to mute (default println)
)
```

### Initialize the object:

```kotlin
featureFlags.init()
```

`init` is a suspend function; call it from a coroutine.

### Run your code conditionally

```kotlin
if (featureFlags.isOn("My feature name", false)) {
    // Code for your feature here
}
```

### Manually refresh flag state

```kotlin
featureFlags.updateState()
```

### Set your log callbacks separately

```kotlin
featureFlags.setInfoCallback(::myInfoLogFunction)
featureFlags.setErrorCallback(::myErrorLogFunction)
```

### Obtain all flag states directly from the SDK and set them

Supposing you have a client-server application, you want your server to handle the updating
of feature flag states, not your client. This lets you control access to your PlainFlags
services more securely.

```kotlin
// Server side:
val flagStates = featureFlags.getCurrentStates()

// Client side, after securely receiving flagStates from your server:
featureFlags.setCurrentStates(flagStates)
```

## Source code

[github link](https://github.com/andreileonte1981/plain-flags/tree/main/sdk/kotlin)
