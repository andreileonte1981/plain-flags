import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:animated_list_plus/animated_list_plus.dart';
import 'package:animated_list_plus/transitions.dart';
import 'package:plainflags_app/domain/flag.dart';
import 'package:plainflags_app/globals/client.dart';
import 'package:plainflags_app/providers/current_flag_id.dart';
import 'package:plainflags_app/providers/user_status.dart';
import 'package:plainflags_app/screens/flags/widgets/flag_card.dart';
import 'package:plainflags_app/screens/flags/widgets/flag_create.dart';
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

  TextEditingController nameFilterController = TextEditingController();
  TextEditingController constraintFilterController = TextEditingController();

  ScrollController flagScroll = ScrollController();

  bool showCreationPanel = false;

  void scrollToId(String id) {
    Future.delayed(const Duration(milliseconds: 500), () {
      if (mounted) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          final index = filteredFlags.indexWhere((flag) => flag.id == id);
          final itemHeight =
              flagScroll.position.maxScrollExtent / filteredFlags.length;
          if (index != -1 && flagScroll.hasClients) {
            final position = index * itemHeight;
            flagScroll.animateTo(
              position,
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeOut,
            );
          }
        });
      }
    });
  }

  void hideCreationPanel() {
    if (mounted) {
      setState(() {
        showCreationPanel = false;
      });
    }
  }

  List<Flag> get filteredFlags {
    return flags.where((flag) {
      final matchesName = flag.name.toLowerCase().contains(nameSearchQuery);

      final matchesConstraint =
          constraintSearchQuery.isEmpty ||
          (constraintSearchQuery.isNotEmpty &&
              flag.constraints.any(
                (constraint) =>
                    constraint.description.toLowerCase().contains(
                      constraintSearchQuery,
                    ) ||
                    constraint.key.toLowerCase().contains(
                      constraintSearchQuery,
                    ) ||
                    constraint.values
                        .join('')
                        .toLowerCase()
                        .contains(constraintSearchQuery),
              ));

      final matchesActive = !showOnlyActive || (showOnlyActive && flag.isOn);
      final matchesStale = !showOnlyStale || (showOnlyStale && flag.stale);

      return matchesName && matchesConstraint && matchesActive && matchesStale;
    }).toList();
  }

  String filterSummary() {
    List<String> parts = [];
    if (showOnlyActive) {
      parts.add('Active');
    }
    if (showOnlyStale) {
      parts.add('Stale');
    }
    if (nameSearchQuery.isNotEmpty) {
      parts.add('"$nameSearchQuery"');
    }
    if (constraintSearchQuery.isNotEmpty) {
      parts.add('"$constraintSearchQuery"');
    }
    return parts.join(', ');
  }

  bool anyFilters() {
    return nameSearchQuery.isNotEmpty ||
        constraintSearchQuery.isNotEmpty ||
        showOnlyActive ||
        showOnlyStale;
  }

  void clearFilters() {
    if (mounted) {
      setState(() {
        nameSearchQuery = '';
        constraintSearchQuery = '';
        showOnlyActive = false;
        showOnlyStale = false;
        nameFilterController.clear();
        constraintFilterController.clear();
      });
    }
  }

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

        if (mounted) {
          setState(() {
            scrollToId(ref.read(currentFlagIdProvider));
          });
        }
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
      floatingActionButton: showFilterPanel || showCreationPanel
          ? null
          : Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                FloatingActionButton(
                  heroTag: 'create_flag',
                  onPressed: () {
                    setState(() {
                      showCreationPanel = !showCreationPanel;
                    });
                  },
                  child: Icon(Icons.add_circle_outline),
                ),
                SizedBox(width: 16),
                FloatingActionButton(
                  heroTag: 'filter_flags',
                  onPressed: () {
                    setState(() {
                      showFilterPanel = !showFilterPanel;
                    });
                  },
                  child: Icon(Icons.search),
                ),
                SizedBox(width: 16),
                FloatingActionButton(
                  heroTag: 'refresh_flags',
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
                  if (showCreationPanel)
                    CreateFlagPanel(
                      hideCreationPanel: hideCreationPanel,
                      fetchFlags: fetchFlags,
                      scrollToId: scrollToId,
                    ),
                  if (showFilterPanel)
                    Card(
                      shape: RoundedRectangleBorder(
                        side: BorderSide(
                          color: const Color.fromARGB(255, 0, 139, 105),
                          width: 2.0,
                        ),
                      ),
                      color: const Color.fromARGB(255, 189, 255, 239),
                      child: Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: Column(
                          children: [
                            TextField(
                              controller: nameFilterController,
                              decoration: InputDecoration(
                                isDense: true,
                                labelText: 'Name filter',
                                filled: true,
                                fillColor: Colors.white,
                                border: OutlineInputBorder(),
                                suffixIcon: IconButton(
                                  icon: Icon(Icons.clear),
                                  onPressed: () {
                                    if (mounted) {
                                      setState(() {
                                        nameSearchQuery = '';
                                        nameFilterController.clear();
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
                              controller: constraintFilterController,
                              decoration: InputDecoration(
                                labelText: 'Constraint filter',
                                isDense: true,
                                filled: true,
                                fillColor: Colors.white,
                                border: OutlineInputBorder(),
                                suffixIcon: IconButton(
                                  icon: Icon(Icons.clear),
                                  onPressed: () {
                                    if (mounted) {
                                      setState(() {
                                        constraintSearchQuery = '';
                                        constraintFilterController.clear();
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
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
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
                  if (!isLoading && flags.isEmpty) Text('No flags'),
                  if (anyFilters() && !showFilterPanel)
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4.0),
                      child: ElevatedButton(
                        onPressed: clearFilters,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.search_off),
                            SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                filterSummary(),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  if (!isLoading && flags.isNotEmpty && filteredFlags.isEmpty)
                    Text('No matches'),
                  if (filteredFlags.isNotEmpty)
                    Expanded(
                      child: ImplicitlyAnimatedList<Flag>(
                        items: filteredFlags,
                        areItemsTheSame: (a, b) => a.id == b.id,
                        controller: flagScroll,
                        padding: const EdgeInsets.only(bottom: 70.0),
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
