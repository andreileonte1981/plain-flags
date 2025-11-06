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
                    setState(() {});
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
                  if (!isLoading && constraints.isEmpty) Text('No constraints'),
                  if (constraints.isNotEmpty)
                    Expanded(
                      child: ImplicitlyAnimatedList<Constraint>(
                        items: constraints,
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
