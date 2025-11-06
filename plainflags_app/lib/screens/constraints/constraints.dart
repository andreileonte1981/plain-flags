import 'package:animated_list_plus/animated_list_plus.dart';
import 'package:animated_list_plus/transitions.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:plainflags_app/domain/constraint.dart';
import 'package:plainflags_app/globals/client.dart';
import 'package:plainflags_app/providers/user_status.dart';
import 'package:plainflags_app/screens/constraints/widgets/constraint_card.dart';
import 'package:plainflags_app/utils/dlog.dart';

class Constraints extends ConsumerStatefulWidget {
  const Constraints({super.key});

  @override
  ConsumerState<Constraints> createState() => _ConstraintsState();
}

class _ConstraintsState extends ConsumerState<Constraints> {
  List<Constraint> constraints = [];

  bool isLoading = false;
  bool failedFetching = false;
  bool _showFABs = true;

  bool showFilterPanel = false;

  String descriptionSearchQuery = '';
  String keySearchQuery = '';
  String valuesSearchQuery = '';

  TextEditingController descriptionFilterController = TextEditingController();
  TextEditingController keyFilterController = TextEditingController();
  TextEditingController valuesFilterController = TextEditingController();

  List<Constraint> get filteredConstraints {
    return constraints.where((constraint) {
      final matchesDescription = constraint.description.toLowerCase().contains(
        descriptionSearchQuery,
      );
      final matchesKey = constraint.key.toLowerCase().contains(keySearchQuery);
      final matchesValues = constraint.values
          .join(' ')
          .toLowerCase()
          .contains(valuesSearchQuery);

      return matchesDescription && matchesKey && matchesValues;
    }).toList();
  }

  String filterSummary() {
    List<String> parts = [];
    if (descriptionSearchQuery.isNotEmpty) {
      parts.add('"$descriptionSearchQuery"');
    }
    if (keySearchQuery.isNotEmpty) {
      parts.add('"$keySearchQuery"');
    }
    if (valuesSearchQuery.isNotEmpty) {
      parts.add('"$valuesSearchQuery"');
    }
    return parts.join(', ');
  }

  bool anyFilters() {
    return descriptionSearchQuery.isNotEmpty ||
        keySearchQuery.isNotEmpty ||
        valuesSearchQuery.isNotEmpty;
  }

  void clearFilters() {
    if (mounted) {
      setState(() {
        descriptionSearchQuery = '';
        keySearchQuery = '';
        valuesSearchQuery = '';
        descriptionFilterController.clear();
        keyFilterController.clear();
        valuesFilterController.clear();
      });
    }
  }

  @override
  void initState() {
    super.initState();
    fetchConstraints();
  }

  Future<void> fetchConstraints() async {
    if (mounted) {
      setState(() {
        isLoading = true;
        failedFetching = false;
      });
    }

    // Don't fetch if there isn't a user or a connection to a service.
    while (ref.read(userStatusNotifierProvider).isLoggedIn == false ||
        Client.apiUrl().isEmpty) {
      await Future.delayed(const Duration(milliseconds: 500));
    }

    try {
      final response = await Client.get(
        'constraints',
        ref.read(userStatusNotifierProvider).token,
      );

      if (response.statusCode == 200) {
        final data = response.body as List<dynamic>;
        constraints = data
            .map((e) => Constraint.fromJson(e as Map<String, dynamic>))
            .toList();
        failedFetching = false;

        if (mounted) setState(() {});
      } else {
        dlog('Failed to fetch constraints: ${response.statusCode}');
        constraints = [];
        failedFetching = true;

        if (mounted) setState(() {});
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Failed to fetch constraints'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      dlog('Error fetching constraints: $e');
      constraints = [];
      failedFetching = true;

      if (mounted) setState(() {});
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error fetching constraints'),
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

  void showFABs() {
    Future.delayed(const Duration(milliseconds: 300), () {
      if (mounted) {
        setState(() {
          _showFABs = true;
        });
      }
    });
  }

  void hideFABs() {
    setState(() {
      _showFABs = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      floatingActionButton: _showFABs
          ? Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                FloatingActionButton(
                  heroTag: 'create_constraint',
                  onPressed: () {
                    setState(() {});
                  },
                  backgroundColor: Color.fromARGB(255, 151, 0, 139),
                  child: Icon(Icons.add_circle_outline),
                ),
                SizedBox(width: 16),
                FloatingActionButton(
                  heroTag: 'filter_constraints',
                  onPressed: () {
                    setState(() {
                      showFilterPanel = !showFilterPanel;
                    });
                  },
                  backgroundColor: Color.fromARGB(255, 151, 0, 139),
                  child: Icon(Icons.search),
                ),
                SizedBox(width: 16),
                FloatingActionButton(
                  heroTag: 'refresh_constraints',
                  onPressed: () {
                    fetchConstraints();
                  },
                  backgroundColor: Color.fromARGB(255, 151, 0, 139),
                  child: Icon(Icons.refresh),
                ),
              ],
            )
          : null,

      body: failedFetching
          ? Center(
              child: Column(
                children: [
                  Text('Failed to fetch constraints.'),
                  Text('Please check your internet connection and try again.'),
                  SizedBox(height: 8),
                  ElevatedButton(
                    onPressed: () {
                      fetchConstraints();
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
                      shape: RoundedRectangleBorder(
                        side: BorderSide(
                          color: const Color.fromARGB(255, 151, 0, 139),
                          width: 2.0,
                        ),
                      ),
                      color: const Color.fromARGB(255, 255, 223, 255),
                      child: Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: Row(
                          children: [
                            Flexible(
                              child: Column(
                                children: [
                                  TextField(
                                    controller: descriptionFilterController,
                                    decoration: InputDecoration(
                                      labelText: 'Description filter',
                                      isDense: true,
                                      filled: true,
                                      fillColor: Colors.white,
                                      border: OutlineInputBorder(),
                                      suffixIcon: IconButton(
                                        icon: Icon(Icons.clear),
                                        onPressed: () {
                                          if (mounted) {
                                            setState(() {
                                              descriptionSearchQuery = '';
                                              descriptionFilterController
                                                  .clear();
                                            });
                                          }
                                        },
                                      ),
                                    ),
                                    onChanged: (value) {
                                      if (mounted) {
                                        setState(() {
                                          descriptionSearchQuery = value
                                              .toLowerCase();
                                        });
                                      }
                                    },
                                  ),
                                  SizedBox(height: 4),
                                  TextField(
                                    controller: keyFilterController,
                                    decoration: InputDecoration(
                                      labelText: 'Key filter',
                                      isDense: true,
                                      filled: true,
                                      fillColor: Colors.white,
                                      border: OutlineInputBorder(),
                                      suffixIcon: IconButton(
                                        icon: Icon(Icons.clear),
                                        onPressed: () {
                                          if (mounted) {
                                            setState(() {
                                              keySearchQuery = '';
                                              keyFilterController.clear();
                                            });
                                          }
                                        },
                                      ),
                                    ),
                                    onChanged: (value) {
                                      if (mounted) {
                                        setState(() {
                                          keySearchQuery = value.toLowerCase();
                                        });
                                      }
                                    },
                                  ),
                                  SizedBox(height: 4),
                                  TextField(
                                    controller: valuesFilterController,
                                    decoration: InputDecoration(
                                      labelText: 'Values filter',
                                      isDense: true,
                                      filled: true,
                                      fillColor: Colors.white,
                                      border: OutlineInputBorder(),
                                      suffixIcon: IconButton(
                                        icon: Icon(Icons.clear),
                                        onPressed: () {
                                          if (mounted) {
                                            setState(() {
                                              valuesSearchQuery = '';
                                              valuesFilterController.clear();
                                            });
                                          }
                                        },
                                      ),
                                    ),
                                    onChanged: (value) {
                                      if (mounted) {
                                        setState(() {
                                          valuesSearchQuery = value
                                              .toLowerCase();
                                        });
                                      }
                                    },
                                  ),
                                ],
                              ),
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
                      ),
                    ),
                  if (!isLoading && constraints.isEmpty) Text('No constraints'),
                  if (anyFilters() && !showFilterPanel)
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4.0),
                      child: ElevatedButton(
                        onPressed: clearFilters,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Color.fromARGB(255, 151, 0, 139),
                        ),
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
                  if (!isLoading &&
                      constraints.isNotEmpty &&
                      filteredConstraints.isEmpty)
                    Text('No matches'),
                  if (filteredConstraints.isNotEmpty)
                    Expanded(
                      child: ImplicitlyAnimatedList<Constraint>(
                        items: filteredConstraints,
                        areItemsTheSame: (a, b) => a.id == b.id,
                        padding: const EdgeInsets.only(bottom: 70.0),
                        itemBuilder: (context, animation, constraint, index) {
                          return SizeFadeTransition(
                            sizeFraction: 0.7,
                            curve: Curves.easeInOut,
                            animation: animation,
                            child: ConstraintCard(
                              key: ValueKey(constraint.id),
                              constraint: constraint,
                              updateConstraints: fetchConstraints,
                              showFABs: showFABs,
                              hideFABs: hideFABs,
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
