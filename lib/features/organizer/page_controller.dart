import 'package:flutter/material.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'page_controller.g.dart';

enum OrganizerPage {
  dashboard(Icons.dashboard, 'Dashboard'),
  tasks(Icons.build_circle, 'Tasks'),
  teams(Icons.group, 'Teams');

  final IconData icon;
  final String title;

  const OrganizerPage(this.icon, this.title);
}

@riverpod
class OrganizerPageController extends _$OrganizerPageController {
  @override
  OrganizerPage build() {
    // The default page when the view is first built.
    return OrganizerPage.dashboard;
  }

  void setPage(OrganizerPage page) {
    state = page;
  }
}
