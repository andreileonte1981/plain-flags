import 'package:uuid/uuid.dart';

String saltUniqued(String s) {
  return '${s}_${Uuid().v4()}';
}
