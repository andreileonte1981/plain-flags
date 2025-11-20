import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:plainflags_app/domain/archived_flags_response.dart';
import 'package:plainflags_app/providers/archived_flags_provider.dart';
import 'package:plainflags_app/providers/user_status.dart';
import 'package:plainflags_app/screens/flags/widgets/archived_flag_item.dart';
import 'package:plainflags_app/widgets/pagination_widget.dart';

class Archived extends ConsumerStatefulWidget {
  const Archived({super.key});

  @override
  ConsumerState<Archived> createState() => _ArchivedState();
}

class _ArchivedState extends ConsumerState<Archived> {
  static const int _pageSize = 10;
  int _currentPage = 1;
  String _filter = '';

  final TextEditingController _filterController = TextEditingController();
  Timer? _debounceTimer;

  // Manual state management
  bool _isLoading = true;
  bool _hasError = false;
  String _errorMessage = '';
  ArchivedFlagsResponse? _response;
  @override
  void initState() {
    super.initState();
    _fetchArchivedFlags();
  }

  @override
  void dispose() {
    _filterController.dispose();
    _debounceTimer?.cancel();
    super.dispose();
  }

  Future<void> _fetchArchivedFlags() async {
    if (!mounted) return;

    setState(() {
      _isLoading = true;
      _hasError = false;
      _errorMessage = '';
    });

    final userStatus = ref.read(userStatusNotifierProvider);
    if (!userStatus.isLoggedIn) {
      setState(() {
        _isLoading = false;
        _hasError = true;
        _errorMessage = 'User not logged in';
      });
      return;
    }

    try {
      final response = await ArchivedFlagsService.fetchArchivedFlags(
        page: _currentPage,
        pageSize: _pageSize,
        filter: _filter,
        token: userStatus.token,
      );

      if (!mounted) return;

      setState(() {
        _isLoading = false;
        _response = response;
        _hasError = response == null;
        _errorMessage = response == null ? 'Failed to load archived flags' : '';
      });
    } catch (e) {
      if (!mounted) return;

      final errorMessage = e.toString();

      setState(() {
        _isLoading = false;
        _hasError = true;
        _errorMessage = errorMessage;
      });

      // Show error modal for better user experience
      _showErrorModal(errorMessage);
    }
  }

  void _showErrorModal(String errorMessage) {
    if (!mounted) return;

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Row(
            children: [
              Icon(Icons.error_outline, color: Colors.red),
              SizedBox(width: 8),
              Text('Error Loading Archived Flags'),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(errorMessage),
              const SizedBox(height: 16),
              const Text(
                'Please check your internet connection and try again.',
                style: TextStyle(fontSize: 14, color: Colors.grey),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('OK'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pop();
                _fetchArchivedFlags();
              },
              child: const Text('Retry'),
            ),
          ],
        );
      },
    );
  }

  void _onPageChanged(int newPage) {
    if (_currentPage != newPage) {
      setState(() {
        _currentPage = newPage;
      });
      _fetchArchivedFlags();
    }
  }

  void _onFilterChanged(String newFilter) {
    // Cancel any existing timer
    _debounceTimer?.cancel();

    // Update UI immediately to show/hide the close icon
    setState(() {});

    // Start a new timer for the actual filtering
    _debounceTimer = Timer(const Duration(milliseconds: 500), () {
      if (_filter != newFilter) {
        setState(() {
          _filter = newFilter;
          _currentPage = 1; // Reset to first page when filtering
        });
        _fetchArchivedFlags();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final userStatus = ref.read(userStatusNotifierProvider);

    if (!userStatus.isLoggedIn) {
      return const Scaffold(
        body: Center(
          child: Text(
            'Please log in to view archived flags',
            style: TextStyle(fontSize: 16, color: Colors.grey),
          ),
        ),
      );
    }

    return Scaffold(
      body: Column(
        children: [
          // Header with pagination and filter
          Container(
            padding: const EdgeInsets.all(16.0),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withValues(alpha: 0.2),
                  spreadRadius: 1,
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              children: [
                // Pagination controls
                if (_isLoading && _response == null)
                  const SizedBox(
                    height: 50,
                    child: Center(child: CircularProgressIndicator()),
                  )
                else if (_hasError)
                  Container(
                    height: 50,
                    alignment: Alignment.center,
                    child: Text(
                      'Error loading pagination info',
                      style: TextStyle(color: Colors.red[600]),
                    ),
                  )
                else if (_response == null)
                  Container(
                    height: 50,
                    alignment: Alignment.center,
                    child: Text(
                      'No data available',
                      style: TextStyle(color: Colors.grey[600]),
                    ),
                  )
                else
                  PaginationWidget(
                    currentPage: _currentPage,
                    totalCount: _response!.count,
                    pageSize: _pageSize,
                    onPageChanged: _onPageChanged,
                  ),

                const SizedBox(height: 16),

                // Search filter
                TextField(
                  controller: _filterController,
                  decoration: InputDecoration(
                    labelText: 'Search by name',
                    hintText: 'Filter archived flags...',
                    prefixIcon: const Icon(Icons.search),
                    suffixIcon: _filterController.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.close),
                            onPressed: () {
                              _filterController.clear();
                              _onFilterChanged('');
                            },
                          )
                        : null,
                    border: const OutlineInputBorder(),
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 12,
                    ),
                  ),
                  onChanged: _onFilterChanged,
                ),
              ],
            ),
          ),

          // Flags list
          Expanded(child: _buildFlagsContent()),
        ],
      ),
    );
  }

  Widget _buildFlagsContent() {
    if (_isLoading) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(),
            SizedBox(height: 16),
            Text(
              'Loading archived flags...',
              style: TextStyle(fontSize: 16, color: Colors.grey),
            ),
          ],
        ),
      );
    }

    if (_hasError) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 64, color: Colors.red[400]),
            const SizedBox(height: 16),
            Text(
              'Failed to load archived flags',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.red[600],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              _errorMessage,
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey[600]),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _fetchArchivedFlags,
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (_response == null) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.info_outline, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text(
              'No data available',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.grey,
              ),
            ),
          ],
        ),
      );
    }

    if (_response!.flags.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.archive_outlined, size: 64, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text(
              _filter.isNotEmpty
                  ? 'No archived flags found matching "$_filter"'
                  : 'No archived flags found',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              _filter.isNotEmpty
                  ? 'Try adjusting your search terms'
                  : 'Archived flags will appear here when they are created',
              style: TextStyle(color: Colors.grey[500]),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _fetchArchivedFlags,
      child: ListView.builder(
        padding: const EdgeInsets.all(8.0),
        itemCount: _response!.flags.length,
        itemBuilder: (context, index) {
          final flag = _response!.flags[index];
          return ArchivedFlagItem(
            key: Key('archived_flag_${flag.id}'),
            flag: flag,
          );
        },
      ),
    );
  }
}
