import 'dart:async';

import 'package:after_layout/after_layout.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hackncsu_today/features/authenticator/authenticator.dart';
import 'package:hackncsu_today/models/hack_user.dart';
import 'package:hackncsu_today/screens/home/components/logout_modal.dart';
import 'package:hackncsu_today/screens/home/organizer/organizer_view.dart';
import 'package:hackncsu_today/screens/home/participant/participant_view.dart';
import 'package:responsive_framework/responsive_framework.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<ConsumerStatefulWidget> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen>
    with AfterLayoutMixin<HomeScreen> {
  @override
  FutureOr<void> afterFirstLayout(BuildContext context) {
    // this is if the user tries to access the page directly without logging in

    final state = ref.read(authenticatorProvider);

    if (state is Unauthenticated) {
      if (context.mounted) {
        context.replace('/login');
      }
    }
  }

  Widget _authenticatedBuilder(BuildContext context, Authenticated state) {
    final hackUser = state.user;

    switch (hackUser) {
      case Organizer():
        return OrganizerView();
      case Participant():
        return ParticipantView(hackUser);
    }
  }

  Widget _notAuthenticatedBuilder(
    BuildContext context,
    AuthenticatorState state,
  ) {
    return Center(child: CircularProgressIndicator());
  }

  AppBar _appBarBuilder(
    BuildContext context,
    Authenticated state,
    bool isDesktop,
  ) {
    return AppBar(
      title: Text(state.user is Participant ? 'Dashboard' : 'Scanner'),
      actions: [
        if (isDesktop) ...[
          Text('Logged in as ${state.user}'),
          SizedBox(width: 10),
        ],
        isDesktop
            ? FilledButton.tonalIcon(
              onPressed:
                  () => showDialog(
                    context: context,
                    builder: (_) => LogoutModal(),
                  ),
              icon: const Icon(Icons.logout),
              label: Text('Log out'),
            )
            : IconButton.filledTonal(
              onPressed:
                  () => showDialog(
                    context: context,
                    builder: (_) => LogoutModal(),
                  ),
              icon: Icon(Icons.logout),
              tooltip: 'Log out',
            ),
        SizedBox(width: 10),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    // authenticator will try to auto login once initialized
    // let's listen and redirect if it fails (or if the user logs out)
    ref.listen(authenticatorProvider, (previous, next) {
      print('Authenticator state changed: $next');
      if (next is Unauthenticated) {
        if (context.mounted) {
          context.replace('/login');
        }
      }
    });

    final state = ref.watch(authenticatorProvider);
    final isDesktop = ResponsiveBreakpoints.of(context).isDesktop;

    return Scaffold(
      // appBar:
      //     state is Authenticated
      //         ? _appBarBuilder(context, state, isDesktop)
      //         : null,
      body:
          state is Authenticated
              ? _authenticatedBuilder(context, state)
              : _notAuthenticatedBuilder(context, state),
      floatingActionButton:
          state is Authenticated
              ? FloatingActionButton(
                onPressed:
                    () => showDialog(
                      context: context,
                      builder: (_) => LogoutModal(),
                    ),
                tooltip: 'Log out (${state.user})',
                child: Icon(Icons.logout),
              )
              : null,
    );
  }
}
