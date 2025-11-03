import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:animated_list_plus/animated_list_plus.dart';
import 'package:animated_list_plus/transitions.dart';
import 'package:plainflags_app/domain/flag.dart';
import 'package:plainflags_app/globals/client.dart';
import 'package:plainflags_app/providers/user_status.dart';
import 'package:plainflags_app/screens/flags/widgets/flag_card.dart';
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

  bool showFilterPanel = false;
  String nameSearchQuery = '';
  String constraintSearchQuery = '';
  bool showOnlyActive = false;
  bool showOnlyStale = false;

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
      floatingActionButton: Row(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          FloatingActionButton(
            onPressed: () {},
            child: Icon(Icons.add_circle_outline),
          ),
          SizedBox(width: 16),
          FloatingActionButton(
            onPressed: () {
              setState(() {
                showFilterPanel = !showFilterPanel;
              });
            },
            child: Icon(Icons.search),
          ),
          SizedBox(width: 16),
          FloatingActionButton(
            onPressed: () {
              fetchFlags();
            },
            child: Icon(Icons.refresh),
          ),
        ],
      ),
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
                  if (showFilterPanel)
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: Column(
                          children: [
                            TextField(
                              decoration: InputDecoration(
                                labelText: 'Name filter',
                                border: OutlineInputBorder(),
                                suffixIcon: IconButton(
                                  icon: Icon(Icons.clear),
                                  onPressed: () {
                                    if (mounted) {
                                      setState(() {
                                        nameSearchQuery = '';
                                      });
                                    }
                                  },
                                ),
                              ),
                              onChanged: (value) {
                                if (mounted) {
                                  setState(() {
                                    nameSearchQuery = value.toLowerCase();
                                  });
                                }
                              },
                            ),
                            SizedBox(height: 4),
                            TextField(
                              decoration: InputDecoration(
                                labelText: 'Constraint filter',
                                border: OutlineInputBorder(),
                                suffixIcon: IconButton(
                                  icon: Icon(Icons.clear),
                                  onPressed: () {
                                    if (mounted) {
                                      setState(() {
                                        constraintSearchQuery = '';
                                      });
                                    }
                                  },
                                ),
                              ),
                              onChanged: (value) {
                                if (mounted) {
                                  setState(() {
                                    constraintSearchQuery = value.toLowerCase();
                                  });
                                }
                              },
                            ),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceAround,
                              children: [
                                Row(
                                  children: [
                                    Text('Active'),
                                    const SizedBox(width: 8),
                                    Switch(
                                      value: showOnlyActive,
                                      onChanged: (onChanged) {
                                        if (mounted) {
                                          setState(() {
                                            showOnlyActive = onChanged;
                                          });
                                        }
                                      },
                                    ),
                                  ],
                                ),
                                Row(
                                  children: [
                                    Text('Stale'),
                                    const SizedBox(width: 8),
                                    Switch(
                                      value: showOnlyStale,
                                      onChanged: (onChanged) {
                                        if (mounted) {
                                          setState(() {
                                            showOnlyStale = onChanged;
                                          });
                                        }
                                      },
                                    ),
                                  ],
                                ),
                                IconButton(
                                  onPressed: () {
                                    setState(() {
                                      showFilterPanel = false;
                                    });
                                  },
                                  icon: Icon(Icons.cancel),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  if (!isLoading && flags.isEmpty) Text('No flags available'),
                  if (flags.isNotEmpty)
                    Expanded(
                      child: ImplicitlyAnimatedList<Flag>(
                        items: flags,
                        areItemsTheSame: (a, b) => a.id == b.id,
                        itemBuilder: (context, animation, flag, index) {
                          return SizeFadeTransition(
                            sizeFraction: 0.7,
                            curve: Curves.easeInOut,
                            animation: animation,
                            child: FlagCard(
                              key: ValueKey(flag.id),
                              flag: flag,
                              updateFlags: fetchFlags,
                            ),
                          );
                        },
                      ),
                    ),
                ],
              ),
            ),
    );
  }
}
