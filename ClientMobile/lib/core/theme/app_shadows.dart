import 'package:flutter/material.dart';

class AppShadows {
  AppShadows._();

  static const List<BoxShadow> light = [
    BoxShadow(
      color: Color(0x0A000000), // 4% opacity
      blurRadius: 10,
      offset: Offset(0, 4),
    )
  ];

  static const List<BoxShadow> medium = [
    BoxShadow(
      color: Color(0x14000000), // 8% opacity
      blurRadius: 16,
      offset: Offset(0, 6),
    )
  ];

  static const List<BoxShadow> heavy = [
    BoxShadow(
      color: Color(0x1F000000), // 12% opacity
      blurRadius: 24,
      offset: Offset(0, 8),
    )
  ];
}
