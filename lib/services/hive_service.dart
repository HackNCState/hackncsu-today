import 'package:hackncsu_today/exception.dart';

/// contains box names lol
class HiveService {
  static const oauth2Cache = "oauth2_cache";
}

class BoxClosedException extends AppException {
  final String boxName;

  const BoxClosedException(this.boxName) : super("the Box '$boxName' was used despite being closed or unopened");
}