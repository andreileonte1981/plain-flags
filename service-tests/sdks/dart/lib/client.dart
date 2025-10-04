import 'dart:convert';
import 'package:dart_sdk_test/dotenv.dart';
import 'package:http/http.dart' as http;

class Response {
  final int statusCode;
  final dynamic body;

  Response(this.statusCode, this.body);
}

class Client {
  String _baseUrl = 'http://localhost:5000';

  Client() {
    _baseUrl = DotEnv.get('API_URL_MGT') ?? 'http://localhost:5000';
  }

  Map<String, String> getHeaders(String? token) {
    var headers = {'Content-Type': 'application/json'};

    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }

    return headers;
  }

  Future<Response> post(
    String endpoint,
    Map<String, dynamic> data,
    String? token,
  ) async {
    var headers = getHeaders(token);

    final response = await http.post(
      Uri.parse('$_baseUrl$endpoint'),
      headers: headers,
      body: json.encode(data),
    );

    return Response(response.statusCode, json.decode(response.body));
  }
}
