import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:plainflags_app/domain/flag.dart';
import 'package:plainflags_app/globals/client.dart';
import 'package:plainflags_app/providers/user_status.dart';
import 'package:plainflags_app/utils/dlog.dart';

class Flags extends ConsumerStatefulWidget {
  const Flags({super.key});

  @override
  ConsumerState<Flags> createState() => _FlagsState();
}

class _FlagsState extends ConsumerState<Flags> {
  List<Flag> flags = [];
  bool isLoading = false;
  bool failedFetching = false;

  @override
  void initState() {
    super.initState();

    fetchFlags();
  }

  Future<void> fetchFlags() async {
    if (mounted) {
      setState(() {
        isLoading = true;
      });
    }

    // Don't fetch if there isn't a user or a connection to a service.
    while (ref.read(userStatusNotifierProvider).isLoggedIn == false ||
        Client.apiUrl().isEmpty) {
      await Future.delayed(const Duration(milliseconds: 500));
    }

    try {
      final response = await Client.get(
        'flags',
        ref.read(userStatusNotifierProvider).token,
      );
      if (response.statusCode == 200) {
        final data = response.body as List<dynamic>;
        flags = data
            .map((e) => Flag.fromJson(e as Map<String, dynamic>))
            .toList();
        failedFetching = false;

        if (mounted) setState(() {});
      } else {
        dlog('Failed to fetch flags: ${response.statusCode}');
        flags = [];
        failedFetching = true;

        if (mounted) setState(() {});
      }
    } catch (e) {
      dlog('Error fetching flags: $e');
      flags = [];
      failedFetching = true;

      if (mounted) setState(() {});
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error fetching flags'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: failedFetching
          ? Center(
              child: Column(
                children: [
                  Text('Failed to fetch flags'),
                  Text('Please check your connection and try again.'),
                  SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {
                      if (context.mounted) {
                        setState(() {
                          failedFetching = false;
                        });
                      }
                      fetchFlags();
                    },
                    child: Text('Retry'),
                  ),
                ],
              ),
            )
          : Center(
              child: Column(
                children: [
                  if (isLoading) CircularProgressIndicator(),
                  if (!isLoading && flags.isEmpty) Text('No flags available'),
                  if (!isLoading && flags.isNotEmpty)
                    ...flags.map((flag) => Text(flag.name)),
                ],
              ),
            ),
    );
  }
}
