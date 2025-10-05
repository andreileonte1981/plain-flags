import 'package:plain_flags/src/updates/client.dart';
import 'package:plain_flags/src/updates/config.dart';

import 'constrainer.dart';
import 'flag_state.dart' show FlagStates, FlagState;

class PlainFlags {
  FlagStates _flags = {};
  Function(String)? _infoCallback;
  Function(String)? _errorCallback;
  final PlainFlagsConfig _config;

  /// Creates a PlainFlags instance.
  /// [config] - configuration for the PlainFlags instance.
  /// [infoCallback] - callback function for regular logs (default: print). Pass null to mute.
  /// [errorCallback] - callback function for error logs (default: print). Pass null to mute.
  PlainFlags({
    required PlainFlagsConfig config,
    dynamic Function(String)? infoCallback = print,
    dynamic Function(String)? errorCallback = print,
  }) : _config = config,
       _errorCallback = errorCallback,
       _infoCallback = infoCallback;

  /// Initializes the PlainFlags instance.
  Future<void> init() async {
    if (_config.pollInterval == Duration.zero) {
      if (await updateState()) {
        _info('Flags state initialized');
        _info(_flags.toString());
      }

      return;
    }

    _startPolling();
  }

  Future<void> _startPolling() async {
    await updateState();

    Future.doWhile(() async {
      await Future.delayed(_config.pollInterval);
      await updateState();
      return true;
    });
  }

  /// Updates the flag states from the plain flags states service.
  Future<bool> updateState() async {
    try {
      final response = await Client.get(
        _config.serviceUrl,
        'api/sdk',
        _config.apiKey,
      );

      if (response.statusCode != 200) {
        _error('Error fetching flags state: ${response.statusCode}');
        return false;
      }

      final body = response.body;

      final Map<String, FlagState> states = {};

      for (var entry in body.entries) {
        final flagKey = entry.key;
        final flagValue = entry.value;

        states[flagKey] = FlagState.fromJson(flagValue);
      }

      _flags = states;
    } catch (e) {
      _error('Error updating flags state: $e');
      return false;
    }

    return true;
  }

  /// Checks if a feature flag is enabled.
  /// [flagName] - The name of the feature flag.
  /// [defaultValue] - The default value to return if the flag is not found.
  ///
  /// [context] - The context to evaluate the flag against.
  /// Example:
  /// ```
  /// { 'userId': UserService.currentUser.id, 'country': LocationService.currentCountry }
  /// ```
  bool isOn(String flagName, bool defaultValue, Map<String, String> context) {
    try {
      if (!_flags.containsKey(flagName)) {
        _error('Flag name $flagName not in local cache');

        return defaultValue;
      }

      return Constrainer.isTurnedOn(_flags[flagName]!, context);
    } catch (e) {
      _error('Flag name $flagName state query failed: $e');

      return defaultValue;
    }
  }

  /// Gets the current flag states.
  FlagStates getCurrentStates() {
    return _flags;
  }

  /// Sets the current flag states.
  /// [newStates] - The new flag states to set.
  ///
  /// It is good practice to obtain the fleature flag states on your server side, then securely send them to your client app.
  /// This way you can avoid exposing your Plain Flags API key in the client app.
  void setCurrentStates(FlagStates newStates) {
    _flags = newStates;
  }

  /// Sets the info log callback.
  /// [callback] - The callback function to set.
  void setInfoCallback(Function(String) callback) {
    _infoCallback = callback;
  }

  /// Sets the error log callback.
  /// [callback] - The callback function to set.
  void setErrorCallback(Function(String) callback) {
    _errorCallback = callback;
  }

  void _error(String message) {
    if (_errorCallback != null) {
      _errorCallback!(message);
      return;
    }
  }

  void _info(String message) {
    if (_infoCallback != null) {
      _infoCallback!(message);
      return;
    }
  }
}
