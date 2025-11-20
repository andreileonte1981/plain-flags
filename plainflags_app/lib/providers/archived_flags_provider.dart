import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:plainflags_app/domain/archived_flags_response.dart';
import 'package:plainflags_app/globals/client.dart';
import 'package:plainflags_app/providers/user_status.dart';
import 'package:plainflags_app/utils/dlog.dart';

class ArchivedFlagsService {
  static Future<ArchivedFlagsResponse?> fetchArchivedFlags({
    required int page,
    required int pageSize,
    String filter = '',
    required String token,
  }) async {
    try {
      final response = await Client.get(
        'flags/archivedpage?page=$page&pageSize=$pageSize&filter=$filter',
        token,
      );

      if (response.statusCode == 200) {
        return ArchivedFlagsResponse.fromJson(response.body);
      } else {
        throw Exception('Failed to load archived flags');
      }
    } catch (e) {
      dlog('Error fetching archived flags: $e');
      throw Exception('Failed to load archived flags. Please try again.');
    }
  }
}

// Provider for archived flags
final archivedFlagsProvider =
    FutureProvider.family<ArchivedFlagsResponse?, Map<String, dynamic>>((
      ref,
      params,
    ) {
      final userStatus = ref.watch(userStatusNotifierProvider);

      if (!userStatus.isLoggedIn) {
        return Future.value(null);
      }

      return ArchivedFlagsService.fetchArchivedFlags(
        page: params['page'] as int,
        pageSize: params['pageSize'] as int,
        filter: params['filter'] as String,
        token: userStatus.token,
      );
    });
