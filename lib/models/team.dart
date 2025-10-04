import 'package:freezed_annotation/freezed_annotation.dart';

part 'team.freezed.dart';
part 'team.g.dart';

@freezed
sealed class Team with _$Team {
  const factory Team({
    required String id,
    required String name,
    required List<String> memberIds,
    required String track,
    @Default([]) List<ChecklistItem> checklist,
    String? mentor,
  }) = _Team;

  factory Team.fromJson(Map<String, dynamic> json) => _$TeamFromJson(json);
}

@freezed
sealed class ChecklistItem with _$ChecklistItem {
  const factory ChecklistItem({
    required String title,
    required bool isChecked,
  }) = _ChecklistItem;

  factory ChecklistItem.fromJson(Map<String, dynamic> json) =>
      _$ChecklistItemFromJson(json);
}