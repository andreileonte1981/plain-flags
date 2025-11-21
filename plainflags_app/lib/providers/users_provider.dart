import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:plainflags_app/domain/user.dart';
import 'package:plainflags_app/globals/client.dart';
import 'package:plainflags_app/providers/user_status.dart';
import 'package:plainflags_app/utils/dlog.dart';

class UsersService {
  static Future<List<User>> fetchUsers({required String token}) async {
    try {
      final response = await Client.get('users', token);

      if (response.statusCode == 200) {
        final data = response.body as List<dynamic>;
        return data
            .map((e) => User.fromJson(e as Map<String, dynamic>))
            .toList();
      } else {
        throw Exception('Failed to load users');
      }
    } catch (e) {
      dlog('Error fetching users: $e');
      throw Exception('Failed to load users. Please try again.');
    }
  }

  static Future<void> deleteUser({
    required String userId,
    required String token,
  }) async {
    try {
      final response = await Client.post('users/delete', {'id': userId}, token);

      if (response.statusCode != 200) {
        throw Exception('Failed to delete user');
      }
    } catch (e) {
      dlog('Error deleting user: $e');
      throw Exception('Failed to delete user. Please try again.');
    }
  }
}

// Provider for users list
final usersProvider = FutureProvider<List<User>>((ref) {
  final userStatus = ref.watch(userStatusNotifierProvider);

  if (!userStatus.isLoggedIn) {
    return Future.value(<User>[]);
  }

  return UsersService.fetchUsers(token: userStatus.token);
});
