import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:plainflags_app/domain/flag.dart';
import 'package:plainflags_app/domain/history.dart';
import 'package:plainflags_app/globals/client.dart';
import 'package:plainflags_app/providers/user_status.dart';
import 'package:plainflags_app/screens/flags/widgets/history_item.dart';
import 'package:plainflags_app/utils/dlog.dart';

class ArchivedFlagItem extends ConsumerStatefulWidget {
  final Flag flag;

  const ArchivedFlagItem({super.key, required this.flag});

  @override
  ConsumerState<ArchivedFlagItem> createState() => _ArchivedFlagItemState();
}

class _ArchivedFlagItemState extends ConsumerState<ArchivedFlagItem>
    with SingleTickerProviderStateMixin {
  bool _isExpanded = false;
  bool _isLoadingHistory = false;
  List<History> historyItems = [];
  late AnimationController _animationController;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 200),
      vsync: this,
    );
    _animation = CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _toggleExpanded() {
    setState(() {
      _isExpanded = !_isExpanded;
      if (_isExpanded) {
        _animationController.forward();
        if (historyItems.isEmpty) {
          _fetchHistory();
        }
      } else {
        _animationController.reverse();
      }
    });
  }

  Future<void> _fetchHistory() async {
    setState(() {
      _isLoadingHistory = true;
    });

    try {
      final userStatus = ref.read(userStatusNotifierProvider);
      final response = await Client.post('history', {
        'flagId': widget.flag.id,
      }, userStatus.token);

      if (response.statusCode == 200) {
        final data = response.body as List<dynamic>;
        historyItems = data
            .map((e) => History.fromJson(e as Map<String, dynamic>))
            .toList();

        if (mounted) {
          setState(() {
            _isLoadingHistory = false;
          });
        }
      } else {
        dlog(
          'Failed to fetch flag history: ${response.statusCode} - ${response.body}',
        );
        if (mounted) {
          setState(() {
            _isLoadingHistory = false;
          });
        }
      }
    } catch (e) {
      dlog('Error fetching flag history: $e');
      if (mounted) {
        setState(() {
          _isLoadingHistory = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      child: Column(
        children: [
          ListTile(
            title: Text(
              widget.flag.name,
              style: Theme.of(context).textTheme.titleMedium,
            ),
            subtitle: Text(
              widget.flag.id,
              style: Theme.of(
                context,
              ).textTheme.bodySmall?.copyWith(color: Colors.grey[600]),
            ),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.history, color: Colors.grey[600], size: 20),
                const SizedBox(width: 4),
                Text(
                  'History',
                  style: Theme.of(
                    context,
                  ).textTheme.bodySmall?.copyWith(color: Colors.grey[600]),
                ),
                const SizedBox(width: 8),
                Icon(
                  _isExpanded ? Icons.expand_less : Icons.expand_more,
                  color: Colors.grey[600],
                ),
              ],
            ),
            onTap: _toggleExpanded,
          ),
          SizeTransition(
            sizeFactor: _animation,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey[50],
                border: Border(top: BorderSide(color: Colors.grey[300]!)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.history_toggle_off),
                      SizedBox(width: 8),
                      Text(
                        'Feature History',
                        style: Theme.of(context).textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  if (_isLoadingHistory)
                    const Center(
                      child: Padding(
                        padding: EdgeInsets.all(20.0),
                        child: CircularProgressIndicator(),
                      ),
                    )
                  else if (historyItems.isEmpty)
                    Padding(
                      padding: const EdgeInsets.all(20.0),
                      child: Text(
                        'No history available for this flag.',
                        style: TextStyle(
                          color: Colors.grey[600],
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                    )
                  else
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: historyItems.map((history) {
                        return HistoryItem(history: history);
                      }).toList(),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
