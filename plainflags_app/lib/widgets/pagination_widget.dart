import 'package:flutter/material.dart';

class PaginationWidget extends StatelessWidget {
  final int currentPage;
  final int totalCount;
  final int pageSize;
  final Function(int) onPageChanged;

  const PaginationWidget({
    super.key,
    required this.currentPage,
    required this.totalCount,
    required this.pageSize,
    required this.onPageChanged,
  });

  int get totalPages => (totalCount / pageSize).ceil();

  String get currentIndices {
    final start = (currentPage - 1) * pageSize + 1;
    final end = (start + pageSize - 1) > totalCount
        ? totalCount
        : start + pageSize - 1;
    return '$start to $end of $totalCount';
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        // First page button
        IconButton(
          onPressed: currentPage > 1 ? () => onPageChanged(1) : null,
          icon: const Icon(Icons.first_page),
          tooltip: 'First page',
        ),

        // Previous page button
        IconButton(
          onPressed: currentPage > 1
              ? () => onPageChanged(currentPage - 1)
              : null,
          icon: const Icon(Icons.chevron_left),
          tooltip: 'Previous page',
        ),

        // Current page info
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: Text(
            currentIndices,
            style: Theme.of(
              context,
            ).textTheme.bodyMedium?.copyWith(color: Colors.grey[600]),
          ),
        ),

        // Next page button
        IconButton(
          onPressed: currentPage < totalPages
              ? () => onPageChanged(currentPage + 1)
              : null,
          icon: const Icon(Icons.chevron_right),
          tooltip: 'Next page',
        ),

        // Last page button
        IconButton(
          onPressed: currentPage < totalPages
              ? () => onPageChanged(totalPages)
              : null,
          icon: const Icon(Icons.last_page),
          tooltip: 'Last page',
        ),
      ],
    );
  }
}
