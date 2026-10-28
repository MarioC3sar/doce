import 'package:flutter/material.dart';
import 'entity_screens.dart';

class AppShell extends StatefulWidget {
  const AppShell({super.key});
  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int _index = 0;
  static const _titles = [
    'Controle',
    'Produtos',
    'Clientes',
    'Receitas',
    'Insumos',
  ];
  final _pages = const [
    OrdersScreen(),
    ProductsScreen(),
    ClientsScreen(),
    RecipesScreen(),
    IngredientsScreen(),
  ];
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: Text(_titles[_index]),
      actions: [
        IconButton(
          tooltip: 'Minha Conta',
          onPressed:
              () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => ProfileScreen()),
              ),
          icon: const Icon(Icons.person_outline),
        ),
      ],
    ),
    body: IndexedStack(index: _index, children: _pages),
    bottomNavigationBar: NavigationBar(
      selectedIndex: _index,
      onDestinationSelected: (i) => setState(() => _index = i),
      height: 70,
      destinations: const [
        NavigationDestination(
          icon: Icon(Icons.assignment_outlined),
          selectedIcon: Icon(Icons.assignment),
          label: 'Controle',
        ),
        NavigationDestination(
          icon: Icon(Icons.card_giftcard_outlined),
          selectedIcon: Icon(Icons.card_giftcard),
          label: 'Produtos',
        ),
        NavigationDestination(
          icon: Icon(Icons.people_outline),
          selectedIcon: Icon(Icons.people),
          label: 'Clientes',
        ),
        NavigationDestination(
          icon: Icon(Icons.restaurant_outlined),
          selectedIcon: Icon(Icons.restaurant),
          label: 'Receitas',
        ),
        NavigationDestination(
          icon: Icon(Icons.shopping_basket_outlined),
          selectedIcon: Icon(Icons.shopping_basket),
          label: 'Insumos',
        ),
      ],
    ),
  );
}
