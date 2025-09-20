import 'dart:async';

import 'package:after_layout/after_layout.dart';
import 'package:animated_background/animated_background.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hackncsu_today/screens/login/components/primary_button.dart';
import 'package:hackncsu_today/features/authenticator/authenticator.dart';
import 'package:hackncsu_today/screens/login/components/authenticating_modal.dart';
import 'package:hackncsu_today/screens/login/components/error_modal.dart';
import 'package:responsive_framework/responsive_framework.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen>
    with TickerProviderStateMixin, AfterLayoutMixin<LoginScreen> {
  @override
  FutureOr<void> afterFirstLayout(BuildContext context) {
    if (ref.read(authenticatorProvider) is Authenticated) {
      if (context.mounted) {
        context.replace('/');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context).colorScheme;
    final isDesktop = ResponsiveBreakpoints.of(context).isDesktop;

    // auth handler
    ref.listen(authenticatorProvider, (old, current) async {
      switch (current) {
        case Unauthenticated():
          break;
        case AutoAuthenticating():
          break;
        case Authenticating():
          if (context.canPop() && old is Authenticating) context.pop();

          await showDialog(
            context: context,
            builder: (_) => AuthenticatingModal(state: current),
            barrierDismissible: false,
          );

          break;

        case AuthenticationError():
          if (context.canPop() && old is Authenticating) context.pop();

          showDialog(
            context: context,
            builder: (_) => ErrorModal(current.error.toString()),
          );
          break;

        case Authenticated():
          if (context.mounted) context.replace('/');
          break;
      }
    });

    return Scaffold(
      body: AnimatedBackground(
        behaviour: RandomParticleBehaviour(
          options: ParticleOptions(
            spawnMinSpeed: 10,
            spawnMaxSpeed: 50,
            particleCount: 100,
            baseColor: Theme.of(context).colorScheme.primaryContainer,
          ),
        ),
        vsync: this,
        child: Row(
          children: [
            Expanded(
              flex: 2,
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  crossAxisAlignment:
                      isDesktop
                          ? CrossAxisAlignment.start
                          : CrossAxisAlignment.stretch,
                  children: [
                    Flex(
                      direction: isDesktop ? Axis.horizontal : Axis.vertical,
                      children: [
                        Image.asset('img/name.png', height: 50),
                        Text(
                          '2026',
                          style: TextStyle(
                            fontSize: 45,
                            color: theme.onSurface,
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 15),
                    Text(
                      'Participant Login',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: isDesktop ? 100 : 30,
                      ),
                    ),
                    SizedBox(height: 15),
                    Text(
                      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod" 
                      'tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,' 
                      'quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
                      style: TextStyle(fontSize: 20),
                    ),
                    SizedBox(height: 15),
                    Text(
                      'Note that you must have completed check-in in order to log in. We will '
                      'compare your Discord username to your check-in information in order to '
                      'authenticate you.',
                    ),
                    SizedBox(height: 15),
                    PrimaryButton(
                      onTap: ref.read(authenticatorProvider.notifier).login,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            'Log in with Discord',
                            style: TextStyle(fontSize: 20),
                          ),
                          const SizedBox(width: 16), // Added for spacing
                          Icon(Icons.arrow_forward),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            if (isDesktop) SizedBox(width: 20),
            if (isDesktop) Expanded(flex: 1, child: Placeholder()),
          ],
        ),
      ),
    );
  }
}
