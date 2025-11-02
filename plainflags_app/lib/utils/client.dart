import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:plainflags_app/utils/dlog.dart';

class Response {
  final int statusCode;
  final dynamic body;

  Response(this.statusCode, this.body);
}

class Client {
  static init() async {
    final FlutterSecureStorage storage = const FlutterSecureStorage();

    dlog('Initializing client');

    final baseurl = await storage.read(key: 'api_url');

    dlog('Base URL: $baseurl');

    if (baseurl != null) {
      setBaseUrl(baseurl);
    }
  }

  static String _baseUrl = '';

  static void setBaseUrl(String baseUrl) {
    _baseUrl = baseUrl;
  }

  static String apiUrl() {
    return _baseUrl;
  }

  static String apiUrlShort() {
    return _baseUrl
        .replaceAll('/api', '')
        .replaceAll('http://', '')
        .replaceAll('https://', '');
  }

  static const String _apiKey =
      '43519651501451-319384513264-s-dtatreat7-ewrtwre-897345f-435';

  static Map<String, String> getHeaders(String? token) {
    var headers = {'Content-Type': 'application/json', 'x-api-key': _apiKey};

    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }

    return headers;
  }

  static String imageUrl(String path) {
    return '$_baseUrl/images/$path';
  }

  static Future<Response> post(
    String endpoint,
    Map<String, dynamic> data,
    String? token,
  ) async {
    var headers = getHeaders(token);

    final response = await http.post(
      Uri.parse('${apiUrl()}/$endpoint'),
      headers: headers,
      body: json.encode(data),
    );

    return Response(response.statusCode, json.decode(response.body));
  }

  static Future<Response> get(String endpoint, String? token) async {
    var headers = getHeaders(token);

    final response = await http.get(
      Uri.parse('${apiUrl()}/$endpoint'),
      headers: headers,
    );

    return Response(response.statusCode, json.decode(response.body));
  }
}
