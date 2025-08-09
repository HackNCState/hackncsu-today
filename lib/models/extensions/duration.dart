extension DurationFormatter on Duration {
  /// HH part of HH:MM:SS
  String get hoursComponent => inHours.toString().padLeft(2, '0');
  /// MM part of 00:XX:SS
  String get minutesComponent => (inMinutes % 60).toString().padLeft(2, '0');
  /// SS part of 00:XX:SS
  String get secondsComponent => (inSeconds % 60).toString().padLeft(2, '0');

  /// Returns a formatted string in the format HH:MM:SS
  String toFormattedString() {
    return '$hoursComponent:$minutesComponent:$secondsComponent';
  }

  /// Returns a formatted string in the format MM:SS
  String toShortFormattedString() {
    return '$minutesComponent:$secondsComponent';
  }

  /// Returns a formatted string in the format "H hours, M minutes, S seconds"
  String toVerboseString() {
    final hours = inHours;
    final minutes = (inMinutes % 60);
    final seconds = (inSeconds % 60);

    final parts = <String>[];
    if (hours > 0) parts.add('$hours hour${hours > 1 ? 's' : ''}');
    if (minutes > 0) parts.add('$minutes minute${minutes > 1 ? 's' : ''}');
    if (seconds > 0 || parts.isEmpty) parts.add('$seconds second${seconds > 1 ? 's' : ''}');

    return parts.join(', ');
  }
}