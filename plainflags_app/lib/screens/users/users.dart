import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:plainflags_app/domain/user.dart' as user_domain;
import 'package:plainflags_app/providers/users_provider.dart';
import 'package:plainflags_app/providers/user_status.dart';
import 'package:plainflags_app/screens/users/widgets/user_list_item.dart';
import 'package:plainflags_app/screens/users/widgets/create_users_panel.dart';
import 'package:plainflags_app/screens/users/widgets/create_admin_panel.dart';

class Users extends ConsumerStatefulWidget {
  const Users({super.key});

  @override
  ConsumerState<Users> createState() => _UsersState();
}

class _UsersState extends ConsumerState<Users> {
  String _emailFilter = '';
  final TextEditingController _filterController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _checkAuthorization();
  }

  @override
  void dispose() {
    _filterController.dispose();
    super.dispose();
  }

  void _checkAuthorization() {
    final userStatus = ref.read(userStatusNotifierProvider);
    final userRole = _parseRole(userStatus.role);

    if (userRole != user_domain.Role.admin &&
        userRole != user_domain.Role.superadmin) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          showDialog(
            context: context,
            builder: (context) => AlertDialog(
              title: const Text('Unauthorized'),
              content: const Text(
                'You do not have permission to access this page.',
              ),
              actions: [
                TextButton(
                  onPressed: () {
                    Navigator.of(context).pop();
                    Navigator.of(context).pop(); // Go back to previous screen
                  },
                  child: const Text('OK'),
                ),
              ],
            ),
          );
        }
      });
    }
  }

  user_domain.Role _parseRole(String roleString) {
    switch (roleString.toLowerCase()) {
      case 'superadmin':
        return user_domain.Role.superadmin;
      case 'admin':
        return user_domain.Role.admin;
      case 'user':
        return user_domain.Role.user;
      case 'demo':
        return user_domain.Role.demo;
      default:
        return user_domain.Role.user;
    }
  }

  List<user_domain.User> _filterUsers(List<user_domain.User> users) {
    if (_emailFilter.isEmpty) return users;

    return users
        .where(
          (user) =>
              user.email.toLowerCase().contains(_emailFilter.toLowerCase()),
        )
        .toList();
  }

  void _onUserDeleted() {
    // Refresh the users list
    ref.invalidate(usersProvider);
  }

  void _onUsersCreated() {
    // Refresh the users list
    ref.invalidate(usersProvider);
  }

  void _onAdminCreated() {
    // Refresh the users list
    ref.invalidate(usersProvider);
  }

  void _showCreateUsersPanel() {
    showDialog(
      context: context,
      builder: (context) => CreateUsersPanel(onUsersCreated: _onUsersCreated),
    );
  }

  void _showCreateAdminPanel() {
    showDialog(
      context: context,
      builder: (context) => CreateAdminPanel(onAdminCreated: _onAdminCreated),
    );
  }

  @override
  Widget build(BuildContext context) {
    final userStatus = ref.watch(userStatusNotifierProvider);

    if (!userStatus.isLoggedIn) {
      return const Scaffold(
        body: Center(
          child: Text(
            'Please log in to view users',
            style: TextStyle(fontSize: 16, color: Colors.grey),
          ),
        ),
      );
    }

    final userRole = _parseRole(userStatus.role);
    if (userRole != user_domain.Role.admin &&
        userRole != user_domain.Role.superadmin) {
      return const Scaffold(
        body: Center(
          child: Text(
            'Unauthorized access',
            style: TextStyle(fontSize: 16, color: Colors.red),
          ),
        ),
      );
    }

    final usersAsync = ref.watch(usersProvider);

    return Scaffold(
      body: Column(
        children: [
          // Filter section
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
            child: TextField(
              controller: _filterController,
              decoration: const InputDecoration(
                labelText: 'Find user by email',
                hintText: 'Filter users...',
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(),
                contentPadding: EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 12,
                ),
              ),
              onChanged: (value) {
                setState(() {
                  _emailFilter = value;
                });
              },
            ),
          ),

          // Users list
          Expanded(
            child: usersAsync.when(
              loading: () => const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CircularProgressIndicator(),
                    SizedBox(height: 16),
                    Text(
                      'Loading users...',
                      style: TextStyle(fontSize: 16, color: Colors.grey),
                    ),
                  ],
                ),
              ),
              error: (error, stack) => Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.error_outline, size: 64, color: Colors.red[400]),
                    const SizedBox(height: 16),
                    Text(
                      'Failed to load users',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.red[600],
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      error.toString(),
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.grey[600]),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () {
                        ref.invalidate(usersProvider);
                      },
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
              data: (users) {
                final filteredUsers = _filterUsers(users);

                if (filteredUsers.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.people_outline,
                          size: 64,
                          color: Colors.grey[400],
                        ),
                        const SizedBox(height: 16),
                        Text(
                          _emailFilter.isNotEmpty
                              ? 'No users found matching "$_emailFilter"'
                              : 'No users found',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey[600],
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          _emailFilter.isNotEmpty
                              ? 'Try adjusting your search terms'
                              : 'No users are available',
                          style: TextStyle(color: Colors.grey[500]),
                        ),
                      ],
                    ),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () async {
                    ref.invalidate(usersProvider);
                  },
                  child: ListView.builder(
                    padding: const EdgeInsets.fromLTRB(8.0, 8.0, 8.0, 100.0),
                    itemCount: filteredUsers.length,
                    itemBuilder: (context, index) {
                      final user = filteredUsers[index];
                      return UserListItem(
                        key: Key('user_${user.id}'),
                        user: user,
                        onUserDeleted: _onUserDeleted,
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: Row(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          FloatingActionButton(
            heroTag: "create_users_fab",
            onPressed: _showCreateUsersPanel,
            tooltip: 'Create Users',
            backgroundColor: Colors.blue,
            child: const Icon(Icons.person_add, color: Colors.white),
          ),
          const SizedBox(width: 16),
          FloatingActionButton(
            heroTag: "create_admin_fab",
            onPressed: _showCreateAdminPanel,
            tooltip: 'Create Admin',
            backgroundColor: Colors.orange,
            child: const Icon(Icons.admin_panel_settings, color: Colors.white),
          ),
        ],
      ),
    );
  }
}
