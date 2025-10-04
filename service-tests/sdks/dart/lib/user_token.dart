import 'package:dart_sdk_test/client.dart';
import 'package:dart_sdk_test/salt.dart';

Future<String> userToken(Client client) async {
  final userEmail = '${saltUniqued('dartuser')}@mail.com';
  final password = 'pass01';

  await client.post('/api/users', {
    'email': userEmail,
    'password': password,
  }, null);

  final loginResponse = await client.post('/api/users/login', {
    'email': userEmail,
    'password': password,
  }, null);

  return loginResponse.body['token'];
}
