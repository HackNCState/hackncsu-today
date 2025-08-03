import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:hackncsu_today/constants.dart';
import 'package:web/web.dart' as web;

class DiscordEmbed extends StatelessWidget {
  final String serverID;
  final String channelID;

  const DiscordEmbed({
    super.key,
    required this.serverID,
    required this.channelID,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(4),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child:
            kEmbedDiscord
                ? Stack(
                  children: [
                    Positioned.fill(
                      child: HtmlElementView.fromTagName(
                        tagName: "script",
                        hitTestBehavior:
                            PlatformViewHitTestBehavior.transparent,
                        onElementCreated: (element) {
                          final scriptElement =
                              element as web.HTMLScriptElement;
                          scriptElement.src =
                              "https://cdn.jsdelivr.net/npm/@widgetbot/html-embed";
                          scriptElement.async = true;
                          scriptElement.defer = true;
                        },
                      ),
                    ),
                    Positioned.fill(
                      child: HtmlElementView.fromTagName(
                        tagName: "widgetbot",
                        onElementCreated: (element) {
                          final htmlElement = element as web.HTMLElement;
                          htmlElement.setAttribute('server', serverID);
                          htmlElement.setAttribute('channel', channelID);

                          htmlElement.setAttribute("height", "100%");
                          htmlElement.setAttribute("width", "100%");
                        },
                      ),
                    ),
                  ],
                )
                : Placeholder(strokeWidth: 10),
      ),
    );
  }
}
