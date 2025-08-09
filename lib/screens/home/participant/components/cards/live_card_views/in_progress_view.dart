import 'dart:async';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hackncsu_today/features/streams/event_state_stream.dart';
import 'package:hackncsu_today/models/event/event_state.dart';
import 'package:hackncsu_today/models/extensions/duration.dart';

class LiveCardInProgressView extends ConsumerStatefulWidget {
  final InProgressEventState state;

  const LiveCardInProgressView(this.state, {super.key});

  @override
  ConsumerState<LiveCardInProgressView> createState() =>
      _LiveCardInProgressViewState();
}

class _LiveCardInProgressViewState
    extends ConsumerState<LiveCardInProgressView> {
  static const Duration _firstHourEnd = Duration(hours: 23);
  static const Duration _halfwayPointStart = Duration(hours: 12);
  static const Duration _halfwayPointEnd = Duration(hours: 10);
  static const Duration _finalStretchStart = Duration(hours: 1);
  static const Duration _lastCallStart = Duration(minutes: 30);

  static const List<String> _genericFlavorTitles = [
    'Hack_NCState is in progress!',
  ];
  static const List<String> _genericFlavorText = [
    'Keep coding!',
    'Lock in.',
    'I\'ll think of something later.',
  ];

  static const List<String> _firstHourFlavorTitles = [
    'Hack_NCState has begun!',
  ];
  static const List<String> _firstHourFlavorText = [
    'Can your ideas change the world?',
    'Let the coding marathon commence!',
    "Let's build something amazing together!",
    'Unleash your creativity and innovation!',
    'The future is yours to create!',
    'Start brainstorming and coding your ideas!',
  ];

  static const List<String> _halfwayPointFlavorTitles = [
    'Halfway done!',
    'You\'re halfway through!',
  ];
  static const List<String> _halfwayPointFlavorText = [
    'Keep at it!',
    'Keep pushing forward!',
    "Let's finish strong!",
    'Keep the momentum going!',
    'Let\'s keep the energy up!',
    'Keep the ideas flowing!',
  ];

  static const List<String> _finalStretchFlavorTitles = [
    'Final stretch!',
    'Last hour!',
    'Final hour!',
  ];
  static const List<String> _finalStretchFlavorText = [
    'Finish strong!',
    'Let\'s wrap this up!',
    'Don\'t forget to submit your project!',
    'Make sure your project is ready for submission!',
    'Double-check your project and submit it!',
    'Make sure your project is ready for the judges!',
  ];

  static const List<String> _lastCallFlavorTitles = [
    'Last call!',
    'Final call!',
    'Last chance!',
    'Final chance!',
  ];
  static const List<String> _lastCallFlavorText = [
    'Make sure your project is submitted!',
    'Submit your project now!',
    'Don\'t miss your chance to submit!',
    'Ensure your project is ready for submission!',
  ];

  late Timer _timer;
  int _randomSeed = DateTime.now().millisecondsSinceEpoch;

  @override
  void initState() {
    super.initState();

    _timer = Timer.periodic(const Duration(minutes: 30), (timer) {
      setState(() {
        _randomSeed = DateTime.now().millisecondsSinceEpoch;
      });
    });
  }

  @override
  void dispose() {
    super.dispose();
    _timer.cancel();
  }

  /// Builds the countdown view based on the current countdown duration.
  Widget _randomFlavorTextBuilder(BuildContext context, Duration countdown) {
    final random = Random(_randomSeed);

    if (countdown > _firstHourEnd) {
      return _flavorTextBuilder(
        context,
        _firstHourFlavorTitles[random.nextInt(_firstHourFlavorTitles.length)],
        _firstHourFlavorText[random.nextInt(_firstHourFlavorText.length)],
      );
    } else if (countdown > _halfwayPointStart) {
      return _flavorTextBuilder(
        context,
        _genericFlavorTitles[random.nextInt(_genericFlavorTitles.length)],
        _genericFlavorText[random.nextInt(_genericFlavorText.length)],
      );
    } else if (countdown > _halfwayPointEnd) {
      return _flavorTextBuilder(
        context,
        _halfwayPointFlavorTitles[random.nextInt(
          _halfwayPointFlavorTitles.length,
        )],
        _halfwayPointFlavorText[random.nextInt(_halfwayPointFlavorText.length)],
      );
    } else if (countdown > _finalStretchStart) {
      return _flavorTextBuilder(
        context,
        _genericFlavorTitles[random.nextInt(_genericFlavorTitles.length)],
        _genericFlavorText[random.nextInt(_genericFlavorText.length)],
      );
    } else if (countdown > _lastCallStart) {
      return _flavorTextBuilder(
        context,
        _finalStretchFlavorTitles[random.nextInt(
          _finalStretchFlavorTitles.length,
        )],
        _finalStretchFlavorText[random.nextInt(_finalStretchFlavorText.length)],
      );
    } else {
      return _flavorTextBuilder(
        context,
        _lastCallFlavorTitles[random.nextInt(_lastCallFlavorTitles.length)],
        _lastCallFlavorText[random.nextInt(_lastCallFlavorText.length)],
      );
    }
  }

  Widget _flavorTextBuilder(BuildContext context, String title, String text) {
    return Text('$title $text', style: Theme.of(context).textTheme.titleLarge);
  }

  Widget _announcementBuilder(BuildContext context, String announcement) {
    return RichText(
      text: TextSpan(
        children: [
          TextSpan(
            text: 'Announcement: ',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          TextSpan(text: announcement),
        ],
        style: Theme.of(context).textTheme.titleLarge,
      ),
    );
  }

  Widget _countdownBuilder(BuildContext context, Duration countdown) {
    final announcement = widget.state.announcement;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          countdown.toFormattedString(),
          style: Theme.of(
            context,
          ).textTheme.displayMedium?.copyWith(fontWeight: FontWeight.bold),
        ),
        announcement == null
            ? _randomFlavorTextBuilder(context, countdown)
            : _announcementBuilder(context, announcement),
      ],
    );
  }

  Widget _nullBuilder() {
    return const Text('No countdown available. Is the event in progress?');
  }

  @override
  Widget build(BuildContext context) {
    final countdown = ref.watch(inProgressCountdownStreamProvider);

    return countdown.when(
      data: (duration) {
        if (duration == null) {
          return _nullBuilder();
        }

        return _countdownBuilder(context, duration);
      },
      loading: () => CircularProgressIndicator(),
      error: (_, _) => _nullBuilder(),
    );
  }
}
