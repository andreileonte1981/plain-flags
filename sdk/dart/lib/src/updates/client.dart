import 'dart:convert';
import 'package:http/http.dart' as http;

class Response {
  final int statusCode;
  final dynamic body;

  Response(this.statusCode, this.body);
}

class Client {
  static Future<Response> get(
    String apiUrl,
    String endpoint,
    String apiKey,
  ) async {
    final response = await http.get(
      Uri.parse('$apiUrl/$endpoint'),
      headers: {'Content-Type': 'application/json', 'x-api-key': apiKey},
    );

    return Response(response.statusCode, json.decode(response.body));
  }
}
