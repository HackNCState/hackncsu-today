import 'package:freezed_annotation/freezed_annotation.dart';

part 'event_data.freezed.dart';
part 'event_data.g.dart';

/// Represents event data that is unrelated to a specific event state
@freezed
sealed class EventData with _$EventData {
  const EventData._();

  const factory EventData({
    /// Tracks
    required List<String> tracks,

    /// Loosely related resources (e.g. hackathon website, centennial map...)
    required List<Resource> externalResources,

    /// Strongly related resources (e.g. schedule, catering menu, slides, Devpost, Discord)
    required List<Resource> internalResources,
  }) = _EventData;

  factory EventData.fromJson(Map<String, Object?> json) =>
      _$EventDataFromJson(json);
}

/// Reflects how eventData holds both external and internal resources
enum ResourceSource { external, internal }

/// Represents a resource that can be a link or an internal, hardcoded page
/// The 'hidden' property indicates whether the resource should be hidden from the UI
/// This allows us to manually show and hide resources without having to remove them from the database
@Freezed(unionKey: 'type')
sealed class Resource with _$Resource {
  const Resource._();

  /// e.g. a link to the website, Discord server, etc.
  @FreezedUnionValue('link')
  const factory Resource.link(
    String name,
    String url, {
    @Default(false) bool hidden,
  }) = LinkResource;

  /// hardcoded resources like a schedule page, dialog with catering menu, etc.
  @FreezedUnionValue('action')
  const factory Resource.action(
    String name,
    ActionType action, {
    @Default(false) bool hidden,
  }) = ActionResource;

  factory Resource.fromJson(Map<String, Object?> json) =>
      _$ResourceFromJson(json);
}

/// Represents an internal resource that can be a page or a popup.
@JsonEnum()
enum ActionType { menu }
