import 'package:flutter/material.dart';

class BasicCard extends StatelessWidget {
  final String? title;
  final String? helpText;
  final Widget? child;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final Color? color;

  const BasicCard({
    super.key,
    this.title,
    this.helpText,
    this.child,
    this.padding,
    this.margin,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Card.filled(
      margin: margin,
      color: color,
      child: Padding(
        padding: padding ?? const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (title != null)
                  Text(
                    title!,
                    style: Theme.of(context).textTheme.labelLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.2,
                    ),
                  ),
                if (helpText != null)
                  Tooltip(
                    message: helpText,
                    child: Icon(
                      Icons.help,
                      size: 15,
                      color: Theme.of(
                        context,
                      ).colorScheme.onSurface.withValues(alpha: 0.6),
                    ),
                  ),
              ],
            ),
            if (title != null || helpText != null) const SizedBox(height: 8.0),
            Expanded(child: child ?? const SizedBox.shrink()),
          ],
        ),
      ),
    );
  }
}
