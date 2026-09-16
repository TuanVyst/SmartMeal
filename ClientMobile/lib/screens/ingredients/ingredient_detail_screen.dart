import 'package:flutter/material.dart';

class IngredientDetailScreen extends StatelessWidget {
  final String ingredientId;
  const IngredientDetailScreen({super.key, required this.ingredientId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Chi tiết nguyên liệu')),
      body: const Center(child: Text('Coming soon...')),
    );
  }
}
