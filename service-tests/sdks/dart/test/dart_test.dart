import 'package:dart_sdk_test/client.dart';
import 'package:dart_sdk_test/dotenv.dart';
import 'package:dart_sdk_test/salt.dart';
import 'package:dart_sdk_test/user_token.dart';
import 'package:test/test.dart';
import 'package:plain_flags/plain_flags.dart';

void main() async {
  await DotEnv.init();

  test(
    'Turning on a flag will show it as on in the SDK after initialization',
    () async {
      final client = Client();

      final token = await userToken(client);

      final flagName = saltUniqued('tda-o');

      final createResponse = await client.post('/api/flags', {
        "name": flagName,
      }, token);

      expect(createResponse.statusCode, 201);

      final flagId = createResponse.body['id'];

      final turnOnResponse = await client.post('/api/flags/turnon', {
        "id": flagId,
      }, token);

      expect(turnOnResponse.statusCode, 200);

      final featureFlags = PlainFlags(
        config: PlainFlagsConfig(
          serviceUrl: DotEnv.get('API_URL_STATES') ?? 'http://localhost:5001',
          apiKey: DotEnv.get('API_KEY') ?? '',
          pollInterval: Duration(seconds: 0),
        ),
        infoCallback: null,
        errorCallback: null,
      );

      await Future.delayed(Duration(milliseconds: 1200));

      await featureFlags.init();

      expect(featureFlags.isOn(flagName, false, {}), true);
    },
  );

  test(
    'Turning on a flag will show it as on in the SDK after a manual state update',
    () async {
      final client = Client();

      final token = await userToken(client);

      final flagName = saltUniqued('tda-o');

      final createResponse = await client.post('/api/flags', {
        "name": flagName,
      }, token);

      expect(createResponse.statusCode, 201);

      final flagId = createResponse.body['id'];

      final featureFlags = PlainFlags(
        config: PlainFlagsConfig(
          serviceUrl: DotEnv.get('API_URL_STATES') ?? 'http://localhost:5001',
          apiKey: DotEnv.get('API_KEY') ?? '',
          pollInterval: Duration(seconds: 0),
        ),
        infoCallback: null,
        errorCallback: null,
      );

      await featureFlags.init();

      final turnOnResponse = await client.post('/api/flags/turnon', {
        "id": flagId,
      }, token);

      expect(turnOnResponse.statusCode, 200);

      await Future.delayed(Duration(milliseconds: 1200));

      await featureFlags.updateState();

      expect(featureFlags.isOn(flagName, false, {}), true);
    },
  );

  test('The SDK polls for updates at the specified interval', () async {
    final client = Client();

    final token = await userToken(client);

    final flagName = saltUniqued('tda-o');

    final createResponse = await client.post('/api/flags', {
      "name": flagName,
    }, token);

    expect(createResponse.statusCode, 201);

    final flagId = createResponse.body['id'];

    final featureFlags = PlainFlags(
      config: PlainFlagsConfig(
        serviceUrl: DotEnv.get('API_URL_STATES') ?? 'http://localhost:5001',
        apiKey: DotEnv.get('API_KEY') ?? '',
        pollInterval: Duration(seconds: 1),
      ),
      infoCallback: null,
      errorCallback: null,
    );

    await featureFlags.init();

    await Future.delayed(Duration(milliseconds: 200));

    expect(featureFlags.isOn(flagName, false, {}), false);

    final turnOnResponse = await client.post('/api/flags/turnon', {
      "id": flagId,
    }, token);

    expect(turnOnResponse.statusCode, 200);

    await Future.delayed(Duration(milliseconds: 1200));

    await Future.delayed(Duration(milliseconds: 1200));

    expect(featureFlags.isOn(flagName, false, {}), true);

    final turnOffResponse = await client.post('/api/flags/turnoff', {
      "id": flagId,
    }, token);

    expect(turnOffResponse.statusCode, 200);

    await Future.delayed(Duration(milliseconds: 1200));

    expect(featureFlags.isOn(flagName, false, {}), false);
  });
}
