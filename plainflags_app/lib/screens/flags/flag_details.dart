import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:plainflags_app/domain/constraint.dart';
import 'package:plainflags_app/domain/flag.dart';
import 'package:plainflags_app/domain/history.dart';
import 'package:plainflags_app/globals/client.dart';
import 'package:plainflags_app/providers/user_status.dart';
import 'package:plainflags_app/screens/flags/widgets/flag_badges.dart';
import 'package:plainflags_app/screens/flags/widgets/flag_constraint_section.dart';
import 'package:plainflags_app/utils/dlog.dart';

class FlagDetails extends ConsumerStatefulWidget {
  final String flagId;
  const FlagDetails({super.key, required this.flagId});

  @override
  ConsumerState<FlagDetails> createState() => _FlagDetailsState();
}

class _FlagDetailsState extends ConsumerState<FlagDetails> {
  bool switching = false;
  Flag? flag;
  List<Constraint> allConstraints = [];
  List<History> historyItems = [];

  @override
  void initState() {
    super.initState();

    fetchFlagInfo();

    fetchConstraints();
  }

  void fetchFlagInfo() {
    fetchFlagDetails();
    fetchHistory();
  }

  Future<void> fetchConstraints() async {
    try {
      final userStatus = ref.read(userStatusNotifierProvider);
      final response = await Client.get('constraints', userStatus.token);

      if (response.statusCode == 200) {
        final data = response.body as List<dynamic>;
        allConstraints = data
            .map((e) => Constraint.fromJson(e as Map<String, dynamic>))
            .toList();
      } else {
        dlog(
          'Failed to fetch flag constraints: ${response.statusCode} - ${response.body}',
        );
      }
    } catch (e) {
      dlog('Error fetching flag constraints: $e');
    }
  }

  Future<void> fetchHistory() async {
    try {
      final userStatus = ref.read(userStatusNotifierProvider);
      final response = await Client.post('history', {
        'flagId': widget.flagId,
      }, userStatus.token);

      if (response.statusCode == 200) {
        final data = response.body as List<dynamic>;
        historyItems = data
            .map((e) => History.fromJson(e as Map<String, dynamic>))
            .toList();
      } else {
        dlog(
          'Failed to fetch flag history: ${response.statusCode} - ${response.body}',
        );
      }
    } catch (e) {
      dlog('Error fetching flag history: $e');
    }
  }

  Future<void> fetchFlagDetails() async {
    try {
      final userStatus = ref.read(userStatusNotifierProvider);
      final response = await Client.get(
        'flags/${widget.flagId}',
        userStatus.token,
      );

      if (response.statusCode == 200) {
        final data = response.body as Map<String, dynamic>;
        setState(() {
          flag = Flag.fromJson(data);
        });
      } else {
        dlog(
          'Failed to fetch flag details: ${response.statusCode} - ${response.body}',
        );
      }
    } catch (e) {
      dlog('Error fetching flag details: $e');
    }
  }

  Future<void> turnOn() async {
    // User confirmation:
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Turn feature on'),
        content: Text('Are you sure?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text('No'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: Text('Yes'),
          ),
        ],
      ),
    );

    if (confirmed != true) {
      return;
    }

    try {
      setState(() {
        switching = true;
      });

      final turnOnResponse = await Client.post('flags/turnon', {
        'id': widget.flagId,
      }, ref.read(userStatusNotifierProvider).token);
      if (turnOnResponse.statusCode != 200) {
        dlog(
          'Failed to turn on the flag: ${turnOnResponse.statusCode} - ${turnOnResponse.body}',
        );
        throw Exception('Failed to turn on the flag');
      }
    } catch (e) {
      dlog('Error turning on the flag: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error turning on the flag'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      setState(() {
        switching = false;
      });
      fetchFlagDetails();
    }
  }

  Future<void> turnOff() async {
    // User confirmation:
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Turn feature off'),
        content: Text('Are you sure?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text('No'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: Text('Yes'),
          ),
        ],
      ),
    );

    if (confirmed != true) {
      return;
    }

    try {
      setState(() {
        switching = true;
      });

      final turnOffResponse = await Client.post('flags/turnoff', {
        'id': widget.flagId,
      }, ref.read(userStatusNotifierProvider).token);
      if (turnOffResponse.statusCode != 200) {
        dlog(
          'Failed to turn off the flag: ${turnOffResponse.statusCode} - ${turnOffResponse.body}',
        );
        throw Exception('Failed to turn off the flag');
      }
    } catch (e) {
      dlog('Error turning off the flag: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error turning off the flag'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      setState(() {
        switching = false;
      });
      fetchFlagDetails();
    }
  }

  @override
  Widget build(BuildContext context) {
    final linkableConstraints = allConstraints.where((Constraint c) {
      return !(flag?.constraints.any((fc) => fc.id == c.id) ?? false);
    });

    return SafeArea(
      child: Scaffold(
        appBar: AppBar(
          title: Text(
            flag?.name ?? 'Loading...',
            overflow: TextOverflow.visible,
            softWrap: true,
            style: TextStyle(
              fontSize: 12,
              color: Colors.black87,
              fontWeight: FontWeight.bold,
            ),
          ),
          actions: [
            switching
                ? Padding(
                    padding: const EdgeInsets.only(right: 16.0),
                    child: Center(
                      child: SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                    ),
                  )
                : flag?.isOn ?? false
                ? Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red,
                        padding: EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 8,
                        ),
                      ),
                      onPressed: () {
                        turnOff();
                      },
                      child: Text('Turn off'),
                    ),
                  )
                : Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green,
                        padding: EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 8,
                        ),
                      ),
                      onPressed: () {
                        turnOn();
                      },
                      child: Text('Turn on'),
                    ),
                  ),
          ],
        ),
        body: flag == null
            ? Center(child: CircularProgressIndicator())
            : SingleChildScrollView(
                child: Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      FlagBadges(flag: flag!),
                      Divider(),
                      FlagConstraintSection(
                        linkableConstraints: linkableConstraints,
                        flag: flag!,
                        fetchFlagDetails: fetchFlagDetails,
                      ),
                      Divider(),
                      Row(
                        children: [
                          Icon(Icons.history_toggle_off),
                          SizedBox(width: 8),
                          Text('Feature History'),
                        ],
                      ),
                      Divider(),
                      Column(
                        children: historyItems.map((history) {
                          return ListTile(
                            title: Text(
                              '${history.what} by ${history.userEmail}',
                            ),
                            subtitle: Text(history.when),
                          );
                        }).toList(),
                      ),
                    ],
                  ),
                ),
              ),
      ),
    );
  }
}
