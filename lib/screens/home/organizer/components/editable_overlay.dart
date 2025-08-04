import 'package:flutter/material.dart';

class EditableOverlay extends StatelessWidget {
  final Widget child;
  final void Function() onEdit;

  const EditableOverlay({super.key, required this.child, required this.onEdit});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        child,
        Align(
          alignment: Alignment.topRight,
          child: Tooltip(
            message: 'Edit data',
            child: IconButton.filled(
              onPressed: onEdit,
              icon: const Icon(Icons.edit),
            ),
          ),
        ),
      ],
    );
  }
}
