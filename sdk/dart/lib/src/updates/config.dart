class PlainFlagsConfig {
  String serviceUrl;

  Duration timeout;
  String apiKey;

  Duration pollInterval;

  /// Configuration for PlainFlags.
  /// [serviceUrl] - URL of the PlainFlags service. Example: https://plainflags.mydomain.com
  ///
  /// [timeout] - request timeout duration (default: 20 seconds).
  ///
  /// [apiKey] - API key for authenticating with the PlainFlags service
  ///  as configured with your flag states service on the back end.
  ///
  /// [pollInterval] - interval for polling the flag states from the server.
  ///  Pass 0 to disable polling (default: 0). You can still update flag state manually.
  ///
  PlainFlagsConfig({
    required this.serviceUrl,
    this.timeout = const Duration(seconds: 20),
    this.apiKey = '',
    this.pollInterval = Duration.zero,
  });
}
