import 'package:flutter/material.dart';
import 'package:plainflags_app/domain/history.dart';

class HistoryItem extends StatefulWidget {
  final History history;

  const HistoryItem({super.key, required this.history});

  @override
  State<HistoryItem> createState() => _HistoryItemState();
}

class _HistoryItemState extends State<HistoryItem> {
  TextSpan whatHeDid(String what) {
    switch (what) {
      case 'create':
        return TextSpan(
          text: ' created the feature ',
          style: TextStyle(color: Colors.blue),
        );
      case 'archive':
        return TextSpan(
          text: ' archived the feature ',
          style: TextStyle(color: const Color.fromARGB(255, 54, 0, 0)),
        );
      case 'turnon':
        return TextSpan(
          text: ' turned the feature on ',
          style: TextStyle(color: Colors.green[700]),
        );
      case 'turnoff':
        return TextSpan(
          text: ' turned the feature off ',
          style: TextStyle(color: Colors.red[700]),
        );
      case 'link':
        return TextSpan(
          text: ' constrained the feature to ',
          style: TextStyle(color: const Color.fromARGB(255, 255, 0, 212)),
        );
      case 'unlink':
        return TextSpan(
          text: ' unconstrained the feature from ',
          style: TextStyle(color: const Color.fromARGB(255, 0, 65, 25)),
        );
      case 'cvedit':
        return TextSpan(
          text: ' changed constraint values ',
          style: TextStyle(color: const Color.fromARGB(255, 73, 0, 57)),
        );
      default:
        return TextSpan(text: '');
    }
  }

  @override
  Widget build(BuildContext context) {
    final history = widget.history;
    return Column(
      children: [
        RichText(
          textAlign: TextAlign.start,
          softWrap: true,
          overflow: TextOverflow.visible,
          text: TextSpan(
            text: history.userEmail,
            style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
            children: [
              whatHeDid(history.what),
              TextSpan(
                text: history.constraintInfo != null
                    ? '"${history.constraintInfo}" '
                    : ' ',
                style: TextStyle(
                  color: Colors.black,
                  fontWeight: FontWeight.bold,
                ),
              ),
              TextSpan(
                text: 'at ${history.when}',
                style: TextStyle(
                  color: Colors.grey[600],
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
        Divider(),
      ],
    );
  }
}
