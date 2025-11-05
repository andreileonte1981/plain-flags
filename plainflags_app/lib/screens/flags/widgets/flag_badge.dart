import 'package:flutter/material.dart';

class FlagBadge extends StatelessWidget {
  final Widget child;
  final Color backgroundColor;
  final Color strokeColor;
  final double strokeWidth;

  const FlagBadge({
    super.key,
    required this.child,
    required this.backgroundColor,
    Color? strokeColor,
    this.strokeWidth = 1.0,
  }) : strokeColor = strokeColor ?? Colors.transparent;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(2),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(20), // Fully rounded rectangle
        border: Border.all(color: strokeColor, width: strokeWidth),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        child: child,
      ),
    );
  }
}
