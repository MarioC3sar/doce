import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/models.dart';
import '../services/api_service.dart';
import '../state/session.dart';

const _ink = Color(0xFF5C4D43),
    _muted = Color(0xFF8C7B70),
    _caramel = Color(0xFFD6A284),
    _vanilla = Color(0xFFFDFBF7);
final _api = ApiService();

void _snack(BuildContext context, String text) =>
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(text)));
Future<bool> _confirm(
  BuildContext context,
  String title,
  String body, {
  String confirmLabel = 'Excluir',
}) async =>
    await showDialog<bool>(
      context: context,
      builder:
          (c) => AlertDialog(
            title: Text(title),
            content: Text(body),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(c, false),
                child: const Text('Cancelar'),
              ),
              FilledButton(
                onPressed: () => Navigator.pop(c, true),
                child: Text(confirmLabel),
              ),
            ],
          ),
    ) ??
    false;
String _money(double value) => 'R\$ ${value.toStringAsFixed(2)}';

class IngredientsScreen extends StatelessWidget {
  const IngredientsScreen({super.key});
  @override
  Widget build(BuildContext c) => const _ListScreen(kind: _Kind.ingredient);
}

class RecipesScreen extends StatelessWidget {
  const RecipesScreen({super.key});
  @override
  Widget build(BuildContext c) => const _ListScreen(kind: _Kind.recipe);
}

class ProductsScreen extends StatelessWidget {
  const ProductsScreen({super.key});
  @override
  Widget build(BuildContext c) => const _ListScreen(kind: _Kind.product);
}

class ClientsScreen extends StatelessWidget {
  const ClientsScreen({super.key});
  @override
  Widget build(BuildContext c) => const _ListScreen(kind: _Kind.client);
}

enum _Kind { ingredient, recipe, product, client }

class _ListScreen extends StatefulWidget {
  const _ListScreen({required this.kind});
  final _Kind kind;
  @override
  State<_ListScreen> createState() => _ListScreenState();
}

class _ListScreenState extends State<_ListScreen> {
  bool _loading = true;
  bool _showArchivedClients = false;
  List<dynamic> _items = [];
  String get _path => switch (widget.kind) {
    _Kind.ingredient => '/api/ingredients',
    _Kind.recipe => '/api/recipes',
    _Kind.product => '/api/products',
    _Kind.client => '/api/clients',
  };
  String get _label => switch (widget.kind) {
    _Kind.ingredient => 'insumo',
    _Kind.recipe => 'ficha técnica',
    _Kind.product => 'produto',
    _Kind.client => 'cliente',
  };
  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final rows = switch (widget.kind) {
        _Kind.ingredient => await _api.list(_path, Ingredient.fromJson),
        _Kind.recipe => await _api.list(_path, Recipe.fromJson),
        _Kind.product => await _api.list(_path, Product.fromJson),
        _Kind.client => await _api.list(
          '$_path?includeInactive=true',
          Client.fromJson,
        ),
      };
      final visibleRows =
          widget.kind == _Kind.client
              ? (rows as List<Client>)
                  .where((client) => client.active != _showArchivedClients)
                  .toList()
              : rows;
      if (mounted) setState(() => _items = visibleRows);
    } catch (e) {
      if (mounted) _snack(context, 'Não foi possível carregar $_label: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _openForm([dynamic item]) async {
    final page = switch (widget.kind) {
      _Kind.ingredient => IngredientForm(item: item as Ingredient?),
      _Kind.recipe => RecipeForm(item: item as Recipe?),
      _Kind.product => ProductForm(item: item as Product?),
      _Kind.client => ClientForm(item: item as Client?),
    };
    final changed = await Navigator.push<bool>(
      context,
      MaterialPageRoute(builder: (_) => page),
    );
    if (changed == true) _load();
  }

  Future<void> _delete(dynamic item, String name) async {
    if (!await _confirm(
      context,
      'Excluir $_label',
      'Tem certeza que deseja excluir $name?',
    )) {
      return;
    }
    try {
      await _api.delete('$_path/${item.id}');
      _load();
    } catch (e) {
      if (mounted) _snack(context, 'Não foi possível excluir. $e');
    }
  }

  Future<void> _setClientActive(Client client, bool active) async {
    if (!active &&
        !await _confirm(
          context,
          'Inativar cliente',
          'O cliente sairá da lista ativa, mas os pedidos e o histórico serão preservados.',
          confirmLabel: 'Inativar',
        )) {
      return;
    }
    try {
      if (active) {
        await _api.patch(
          '/api/clients/${client.id}/active',
          query: {'active': 'true'},
        );
      } else {
        // DELETE remains supported by the backend but now means archive/soft delete.
        await _api.delete('/api/clients/${client.id}');
      }
      await _load();
      if (mounted) {
        _snack(context, active ? 'Cliente reativado.' : 'Cliente inativado.');
      }
    } catch (e) {
      if (mounted) _snack(context, 'Não foi possível atualizar o cliente: $e');
    }
  }

  Widget _card(dynamic item) {
    String title = '', detail = '';
    IconData icon = Icons.inventory_2_outlined;
    switch (widget.kind) {
      case _Kind.ingredient:
        final x = item as Ingredient;
        title = x.name;
        detail =
            '${_money(x.packagePrice)} / ${x.packageQuantity}${x.unit}   •   ${_money(x.unitCost)} por ${x.unit}';
        icon = Icons.shopping_basket_outlined;
        break;
      case _Kind.recipe:
        final x = item as Recipe;
        title = x.name;
        detail =
            'Custo total ${_money(x.totalCost)}   •   Rende ${x.yieldCount}';
        icon = Icons.restaurant_outlined;
        break;
      case _Kind.product:
        final x = item as Product;
        title = x.name;
        detail =
            'Custo ${_money(x.totalCost)}   •   Venda ${_money(x.salePrice)}';
        icon = Icons.card_giftcard;
        break;
      case _Kind.client:
        final x = item as Client;
        title = x.name;
        detail =
            '📞 ${x.phone.isEmpty ? 'Sem telefone' : x.phone}\n📍 ${x.address.isEmpty ? 'Sem endereço' : x.address}\n${x.active ? 'Ativo' : 'Inativo'}';
        icon = Icons.person_outline;
        break;
    }
    return Card(
      color: Colors.white,
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shadowColor: _caramel.withValues(alpha: .12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
        leading: CircleAvatar(
          backgroundColor: const Color(0xFFF2E8DF),
          foregroundColor: _caramel,
          child: Icon(icon),
        ),
        title: Text(
          title,
          style: const TextStyle(fontWeight: FontWeight.w800, color: _ink),
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 7),
          child: Text(
            detail,
            style: const TextStyle(color: _muted, height: 1.5),
          ),
        ),
        onTap:
            widget.kind == _Kind.recipe
                ? () => Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder:
                        (_) =>
                            RecipeDetailScreen(recipeId: (item as Recipe).id!),
                  ),
                )
                : widget.kind == _Kind.client
                ? () => Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => ClientOrdersScreen(client: item as Client),
                  ),
                )
                : null,
        trailing: PopupMenuButton<String>(
          onSelected: (v) {
            if (v == 'edit') {
              _openForm(item);
            } else if (v == 'archive' || v == 'activate') {
              _setClientActive(item as Client, v == 'activate');
            } else if (v == 'delete') {
              _delete(item, title);
            } else if (v == 'orders') {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => ClientOrdersScreen(client: item as Client),
                ),
              );
            }
          },
          itemBuilder:
              (_) => [
                const PopupMenuItem(value: 'edit', child: Text('Editar')),
                if (widget.kind == _Kind.client)
                  const PopupMenuItem(
                    value: 'orders',
                    child: Text('Histórico'),
                  ),
                if (widget.kind == _Kind.client && (item as Client).active)
                  const PopupMenuItem(value: 'archive', child: Text('Inativar'))
                else if (widget.kind == _Kind.client)
                  const PopupMenuItem(
                    value: 'activate',
                    child: Text('Reativar'),
                  )
                else
                  const PopupMenuItem(value: 'delete', child: Text('Excluir')),
              ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    backgroundColor: _vanilla,
    body: Column(
      children: [
        if (widget.kind == _Kind.client)
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 10, 16, 0),
            child: SegmentedButton<bool>(
              segments: const [
                ButtonSegment(value: false, label: Text('Ativos')),
                ButtonSegment(value: true, label: Text('Inativos')),
              ],
              selected: {_showArchivedClients},
              onSelectionChanged: (selection) {
                setState(() => _showArchivedClients = selection.single);
                _load();
              },
            ),
          ),
        Expanded(
          child:
              _loading
                  ? const Center(
                    child: CircularProgressIndicator(color: _caramel),
                  )
                  : RefreshIndicator(
                    onRefresh: _load,
                    color: _caramel,
                    child:
                        _items.isEmpty
                            ? ListView(
                              children: [
                                const SizedBox(height: 150),
                                Center(
                                  child: Text(
                                    widget.kind == _Kind.client &&
                                            _showArchivedClients
                                        ? 'Nenhum cliente inativo.'
                                        : 'Nenhum $_label cadastrado.',
                                    style: const TextStyle(color: _muted),
                                  ),
                                ),
                              ],
                            )
                            : ListView.builder(
                              padding: const EdgeInsets.all(16),
                              itemCount: _items.length,
                              itemBuilder: (_, i) => _card(_items[i]),
                            ),
                  ),
        ),
      ],
    ),
    floatingActionButton: FloatingActionButton(
      backgroundColor: _caramel,
      foregroundColor: Colors.white,
      onPressed: () => _openForm(),
      child: const Icon(Icons.add),
    ),
  );
}

class _FormScaffold extends StatelessWidget {
  const _FormScaffold({
    required this.title,
    required this.children,
    required this.onSave,
    this.loading = false,
  });
  final String title;
  final List<Widget> children;
  final Future<void> Function() onSave;
  final bool loading;
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: Text(title)),
    body: SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Card(
            color: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(24),
            ),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  ...children,
                  const SizedBox(height: 12),
                  SizedBox(
                    height: 54,
                    child: FilledButton(
                      onPressed: loading ? null : onSave,
                      style: FilledButton.styleFrom(backgroundColor: _caramel),
                      child:
                          loading
                              ? const CircularProgressIndicator(
                                color: Colors.white,
                              )
                              : const Text(
                                'Salvar',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    ),
  );
}

Widget _field(
  String label,
  TextEditingController controller, {
  bool numeric = false,
  int lines = 1,
  String? hint,
}) => Padding(
  padding: const EdgeInsets.only(bottom: 16),
  child: TextField(
    controller: controller,
    keyboardType:
        numeric
            ? const TextInputType.numberWithOptions(decimal: true)
            : TextInputType.text,
    maxLines: lines,
    decoration: InputDecoration(labelText: label, hintText: hint),
  ),
);

class IngredientForm extends StatefulWidget {
  const IngredientForm({super.key, this.item});
  final Ingredient? item;
  @override
  State<IngredientForm> createState() => _IngredientFormState();
}

class _IngredientFormState extends State<IngredientForm> {
  static const _units = ['g', 'kg', 'ml', 'l', 'un'];
  late final name = TextEditingController(text: widget.item?.name),
      price = TextEditingController(text: widget.item?.packagePrice.toString()),
      qty = TextEditingController(
        text: widget.item?.packageQuantity.toString(),
      );
  String unit = 'g';
  bool busy = false;
  @override
  void initState() {
    super.initState();
    final storedUnit = widget.item?.unit.trim();
    if (storedUnit != null && storedUnit.isNotEmpty) {
      final canonical = _units.where(
        (candidate) => candidate.toLowerCase() == storedUnit.toLowerCase(),
      );
      unit = canonical.isEmpty ? storedUnit : canonical.first;
    }
  }

  @override
  void dispose() {
    name.dispose();
    price.dispose();
    qty.dispose();
    super.dispose();
  }

  Future<void> save() async {
    final p = double.tryParse(price.text.replaceAll(',', '.')),
        q = double.tryParse(qty.text.replaceAll(',', '.'));
    if (name.text.trim().isEmpty || p == null || q == null || q <= 0) {
      _snack(context, 'Preencha os campos com valores válidos.');
      return;
    }
    setState(() => busy = true);
    try {
      final x = Ingredient(
        id: widget.item?.id,
        name: name.text.trim(),
        packagePrice: p,
        packageQuantity: q,
        unit: unit,
      );
      if (widget.item == null) {
        await _api.create('/api/ingredients', x.toJson());
      } else {
        await _api.update('/api/ingredients/${widget.item!.id}', x.toJson());
      }
      if (mounted) Navigator.pop(context, true);
    } catch (e) {
      if (mounted) _snack(context, 'Não foi possível salvar o insumo: $e');
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext c) => _FormScaffold(
    title: widget.item == null ? 'Novo Insumo' : 'Editar Insumo',
    loading: busy,
    onSave: save,
    children: [
      _field('Nome do Insumo', name),
      _field('Preço da Embalagem (R\$)', price, numeric: true),
      _field('Quantidade da Embalagem', qty, numeric: true),
      DropdownButtonFormField<String>(
        value: unit,
        decoration: const InputDecoration(labelText: 'Unidade'),
        items:
            [..._units, if (!_units.contains(unit)) unit]
                .map((x) => DropdownMenuItem(value: x, child: Text(x)))
                .toList(),
        onChanged: (x) => setState(() => unit = x ?? 'g'),
      ),
    ],
  );
}

class ClientForm extends StatefulWidget {
  const ClientForm({super.key, this.item});
  final Client? item;
  @override
  State<ClientForm> createState() => _ClientFormState();
}

class _ClientFormState extends State<ClientForm> {
  late final name = TextEditingController(text: widget.item?.name),
      phone = TextEditingController(text: widget.item?.phone),
      address = TextEditingController(text: widget.item?.address);
  bool busy = false;
  @override
  void dispose() {
    name.dispose();
    phone.dispose();
    address.dispose();
    super.dispose();
  }

  Future<void> save() async {
    if (name.text.trim().isEmpty) {
      _snack(context, 'O nome do cliente é obrigatório.');
      return;
    }
    setState(() => busy = true);
    try {
      final x = Client(
        name: name.text.trim(),
        phone: phone.text.trim(),
        address: address.text.trim(),
      );
      if (widget.item == null) {
        await _api.create('/api/clients', x.toJson());
      } else {
        await _api.update('/api/clients/${widget.item!.id}', x.toJson());
      }
      if (mounted) Navigator.pop(context, true);
    } catch (e) {
      if (mounted) _snack(context, 'Não foi possível salvar o cliente: $e');
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext c) => _FormScaffold(
    title: widget.item == null ? 'Novo Cliente' : 'Editar Cliente',
    loading: busy,
    onSave: save,
    children: [
      _field('Nome Completo', name),
      _field('Telefone / WhatsApp', phone, numeric: true),
      _field('Endereço', address, lines: 3),
    ],
  );
}

class _RecipeLine {
  int? ingredientId;
  final controller = TextEditingController();
}

class RecipeForm extends StatefulWidget {
  const RecipeForm({super.key, this.item});
  final Recipe? item;
  @override
  State<RecipeForm> createState() => _RecipeFormState();
}

class _RecipeFormState extends State<RecipeForm> {
  late final name = TextEditingController(text: widget.item?.name),
      yieldController = TextEditingController(
        text: widget.item?.yieldCount.toString(),
      );
  List<Ingredient> ingredients = [];
  final lines = <_RecipeLine>[];
  bool busy = false, loading = true;
  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      ingredients = await _api.list('/api/ingredients', Ingredient.fromJson);
      if (widget.item != null) {
        for (final x in widget.item!.items) {
          lines.add(
            _RecipeLine()
              ..ingredientId = x.ingredient.id
              ..controller.text = x.quantityUsed.toString(),
          );
        }
      }
      if (lines.isEmpty) lines.add(_RecipeLine());
    } catch (e) {
      if (mounted) _snack(context, 'Não foi possível carregar insumos: $e');
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  void dispose() {
    name.dispose();
    yieldController.dispose();
    for (final l in lines) {
      l.controller.dispose();
    }
    super.dispose();
  }

  Future<void> save() async {
    final y = int.tryParse(yieldController.text);
    final valid =
        lines
            .where(
              (l) =>
                  l.ingredientId != null &&
                  ((double.tryParse(l.controller.text.replaceAll(',', '.')) ??
                          0) >
                      0),
            )
            .toList();
    if (name.text.trim().isEmpty || y == null || y < 1 || valid.isEmpty) {
      _snack(
        context,
        'Preencha nome e rendimento e adicione pelo menos um insumo válido.',
      );
      return;
    }
    setState(() => busy = true);
    try {
      final payload = {
        'name': name.text.trim(),
        'yield': y,
        'items':
            valid
                .map(
                  (l) => {
                    'ingredient': {'id': l.ingredientId},
                    'quantityUsed': double.parse(
                      l.controller.text.replaceAll(',', '.'),
                    ),
                  },
                )
                .toList(),
      };
      if (widget.item == null) {
        await _api.create('/api/recipes', payload);
      } else {
        await _api.update('/api/recipes/${widget.item!.id}', payload);
      }
      if (mounted) Navigator.pop(context, true);
    } catch (e) {
      if (mounted) _snack(context, 'Não foi possível salvar a ficha: $e');
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext c) => _FormScaffold(
    title: widget.item == null ? 'Montar Ficha Técnica' : 'Editar Ficha',
    loading: busy || loading,
    onSave: save,
    children: [
      _field('Nome da Receita', name),
      _field('Rendimento', yieldController, numeric: true),
      const Text(
        'Insumos',
        style: TextStyle(fontWeight: FontWeight.bold, color: _ink),
      ),
      ...lines.map(
        (line) => Padding(
          padding: const EdgeInsets.symmetric(vertical: 5),
          child: Row(
            children: [
              Expanded(
                flex: 3,
                child: DropdownButtonFormField<int>(
                  value: line.ingredientId,
                  decoration: const InputDecoration(labelText: 'Insumo'),
                  items:
                      ingredients
                          .map(
                            (i) => DropdownMenuItem(
                              value: i.id,
                              child: Text(
                                i.name,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          )
                          .toList(),
                  onChanged: (x) => setState(() => line.ingredientId = x),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: TextField(
                  controller: line.controller,
                  keyboardType: const TextInputType.numberWithOptions(
                    decimal: true,
                  ),
                  decoration: const InputDecoration(labelText: 'Qtd'),
                ),
              ),
              IconButton(
                onPressed:
                    lines.length == 1
                        ? null
                        : () => setState(() => lines.remove(line)),
                icon: const Icon(Icons.remove_circle_outline),
              ),
            ],
          ),
        ),
      ),
      TextButton.icon(
        onPressed: () => setState(() => lines.add(_RecipeLine())),
        icon: const Icon(Icons.add),
        label: const Text('Adicionar insumo'),
      ),
    ],
  );
}

class _ProductLine {
  int? id;
  final controller = TextEditingController();
}

class ProductForm extends StatefulWidget {
  const ProductForm({super.key, this.item});
  final Product? item;
  @override
  State<ProductForm> createState() => _ProductFormState();
}

class _ProductFormState extends State<ProductForm> {
  late final name = TextEditingController(text: widget.item?.name),
      price = TextEditingController(text: widget.item?.salePrice.toString());
  List<Recipe> recipes = [];
  List<Ingredient> ingredients = [];
  final recipeLines = <_ProductLine>[], ingredientLines = <_ProductLine>[];
  bool busy = false, loading = true;
  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final result = await Future.wait([
        _api.list('/api/recipes', Recipe.fromJson),
        _api.list('/api/ingredients', Ingredient.fromJson),
      ]);
      recipes = result[0] as List<Recipe>;
      ingredients = result[1] as List<Ingredient>;
      if (widget.item != null) {
        for (final x in widget.item!.recipes) {
          recipeLines.add(
            _ProductLine()
              ..id = x.recipeId
              ..controller.text = x.quantity.toString(),
          );
        }
        for (final x in widget.item!.ingredients) {
          ingredientLines.add(
            _ProductLine()
              ..id = x.ingredientId
              ..controller.text = x.quantityUsed.toString(),
          );
        }
      }
      if (recipeLines.isEmpty) recipeLines.add(_ProductLine());
      if (ingredientLines.isEmpty) ingredientLines.add(_ProductLine());
    } catch (e) {
      if (mounted) _snack(context, 'Falha ao carregar insumos e receitas: $e');
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  void dispose() {
    name.dispose();
    price.dispose();
    for (final l in [...recipeLines, ...ingredientLines]) {
      l.controller.dispose();
    }
    super.dispose();
  }

  Future<void> save() async {
    final p = double.tryParse(price.text.replaceAll(',', '.'));
    if (name.text.trim().isEmpty || p == null) {
      _snack(context, 'Preencha nome e preço de venda.');
      return;
    }
    final r =
        recipeLines
            .where(
              (l) => l.id != null && (int.tryParse(l.controller.text) ?? 0) > 0,
            )
            .map(
              (l) => ProductRecipeItem(
                recipeId: l.id!,
                quantity: int.parse(l.controller.text),
              ),
            )
            .toList();
    final ing =
        ingredientLines
            .where(
              (l) =>
                  l.id != null &&
                  (double.tryParse(l.controller.text.replaceAll(',', '.')) ??
                          0) >
                      0,
            )
            .map(
              (l) => ProductIngredientItem(
                ingredientId: l.id!,
                quantityUsed: double.parse(
                  l.controller.text.replaceAll(',', '.'),
                ),
              ),
            )
            .toList();
    setState(() => busy = true);
    try {
      final x = Product(
        name: name.text.trim(),
        salePrice: p,
        recipes: r,
        ingredients: ing,
      );
      if (widget.item == null) {
        await _api.create('/api/products', x.toJson());
      } else {
        await _api.update('/api/products/${widget.item!.id}', x.toJson());
      }
      if (mounted) Navigator.pop(context, true);
    } catch (e) {
      if (mounted) _snack(context, 'Não foi possível salvar o produto: $e');
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  Widget _lines(
    String label,
    List<_ProductLine> lines,
    List<dynamic> options,
    bool recipe,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          label,
          style: const TextStyle(fontWeight: FontWeight.bold, color: _ink),
        ),
        ...lines.map(
          (l) => Row(
            children: [
              Expanded(
                flex: 3,
                child: DropdownButtonFormField<int>(
                  value: l.id,
                  decoration: InputDecoration(
                    labelText: recipe ? 'Doce' : 'Embalagem',
                  ),
                  items:
                      options
                          .map(
                            (dynamic x) => DropdownMenuItem<int>(
                              value: x.id as int,
                              child: Text(
                                x.name as String,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          )
                          .toList(),
                  onChanged: (x) => setState(() => l.id = x),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: TextField(
                  controller: l.controller,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    labelText: recipe ? 'Qtd' : 'Uso',
                  ),
                ),
              ),
              IconButton(
                onPressed:
                    lines.length == 1
                        ? null
                        : () => setState(() => lines.remove(l)),
                icon: const Icon(Icons.remove_circle_outline),
              ),
            ],
          ),
        ),
        TextButton.icon(
          onPressed: () => setState(() => lines.add(_ProductLine())),
          icon: const Icon(Icons.add),
          label: Text('Adicionar ${recipe ? 'doce' : 'insumo'}'),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext c) => _FormScaffold(
    title: widget.item == null ? 'Novo Produto' : 'Editar Produto',
    loading: busy || loading,
    onSave: save,
    children: [
      _field('Nome do Produto', name),
      _field('Preço de Venda (R\$)', price, numeric: true),
      _lines('Doces da caixa', recipeLines, recipes, true),
      const SizedBox(height: 12),
      _lines('Insumos e embalagens', ingredientLines, ingredients, false),
    ],
  );
}

class RecipeDetailScreen extends StatefulWidget {
  const RecipeDetailScreen({super.key, required this.recipeId});
  final int recipeId;
  @override
  State<RecipeDetailScreen> createState() => _RecipeDetailScreenState();
}

class _RecipeDetailScreenState extends State<RecipeDetailScreen> {
  Recipe? recipe;
  bool loading = true;
  @override
  void initState() {
    super.initState();
    _api
        .get('/api/recipes/${widget.recipeId}', Recipe.fromJson)
        .then((v) => setState(() => recipe = v))
        .catchError((e) {
          if (mounted) _snack(context, 'Não foi possível carregar a ficha: $e');
        })
        .whenComplete(() => setState(() => loading = false));
  }

  @override
  Widget build(BuildContext c) => Scaffold(
    appBar: AppBar(title: const Text('Detalhes da Ficha')),
    body:
        loading
            ? const Center(child: CircularProgressIndicator())
            : recipe == null
            ? const Center(child: Text('Ficha indisponível'))
            : ListView(
              padding: const EdgeInsets.all(20),
              children: [
                Text(
                  recipe!.name,
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w900,
                    color: _ink,
                  ),
                ),
                const SizedBox(height: 16),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(18),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Custo da Panela  ${_money(recipe!.totalCost)}'),
                        Text('Rendimento  ${recipe!.yieldCount}'),
                        Text(
                          'Custo Unitário  ${_money(recipe!.yieldCount == 0 ? 0 : recipe!.totalCost / recipe!.yieldCount)}',
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'Insumos',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                ...recipe!.items.map(
                  (i) => ListTile(
                    title: Text(i.ingredient.name),
                    subtitle: Text(
                      '${i.quantityUsed}${i.ingredient.unit} • ${_money(i.calculatedCost)}',
                    ),
                  ),
                ),
              ],
            ),
  );
}

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Minha Conta')),
    body: ListView(
      padding: const EdgeInsets.all(20),
      children: [
        const Text('Gerenciamento de acesso', style: TextStyle(color: _muted)),
        const SizedBox(height: 16),
        ListTile(
          leading: const Icon(Icons.logout, color: _caramel),
          title: const Text('Sair do Aplicativo'),
          onTap: () async {
            final ok = await _confirm(
              context,
              'Sair',
              'Deseja encerrar a sessão?',
              confirmLabel: 'Sair',
            );
            if (ok && context.mounted) await context.read<Session>().logout();
          },
        ),
      ],
    ),
  );
}

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});
  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  List<CustomerOrder> orders = [];
  bool loading = true;
  String filter = 'OPEN';
  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => loading = true);
    try {
      orders = await _api.list('/api/orders', CustomerOrder.fromJson);
      orders = orders.reversed.toList();
    } catch (e) {
      if (mounted) _snack(context, 'Não foi possível carregar os pedidos: $e');
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  Future<void> _payment(CustomerOrder o) async {
    final value = o.paymentStatus == 'Pago' ? 'A Receber' : 'Pago';
    try {
      await _api.patchOrderStatus(o.id!, paymentStatus: value);
      setState(
        () =>
            orders =
                orders
                    .map(
                      (x) =>
                          x.id == o.id
                              ? CustomerOrder(
                                id: x.id,
                                client: x.client,
                                deliveryDate: x.deliveryDate,
                                totalAmount: x.totalAmount,
                                status: x.status,
                                paymentStatus: value,
                                items: x.items,
                              )
                              : x,
                    )
                    .toList(),
      );
    } catch (e) {
      if (mounted) _snack(context, 'Falha ao atualizar pagamento: $e');
    }
  }

  Future<void> _production(CustomerOrder o) async {
    final value = o.status == 'Entregue' ? 'Pendente' : 'Entregue';
    try {
      await _api.patchOrderStatus(o.id!, status: value);
      setState(
        () =>
            orders =
                orders
                    .map(
                      (x) =>
                          x.id == o.id
                              ? CustomerOrder(
                                id: x.id,
                                client: x.client,
                                deliveryDate: x.deliveryDate,
                                totalAmount: x.totalAmount,
                                status: value,
                                paymentStatus: x.paymentStatus,
                                items: x.items,
                              )
                              : x,
                    )
                    .toList(),
      );
    } catch (e) {
      if (mounted) _snack(context, 'Falha ao atualizar status: $e');
    }
  }

  List<CustomerOrder> get shown => switch (filter) {
    'OPEN' => orders.where((o) => o.status != 'Entregue').toList(),
    'PAYMENT' => orders.where((o) => o.paymentStatus != 'Pago').toList(),
    'PAID' => orders.where((o) => o.paymentStatus == 'Pago').toList(),
    _ => orders,
  };
  double get sumShown => shown.fold(0, (s, o) => s + o.totalAmount);
  Widget _orderCard(CustomerOrder o) {
    final paid = o.paymentStatus == 'Pago', delivered = o.status == 'Entregue';
    return Card(
      color: Colors.white,
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        o.client?.name ?? 'Cliente Removido',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          color: _ink,
                        ),
                      ),
                      Text(
                        'Pedido #${o.id}',
                        style: const TextStyle(color: _muted),
                      ),
                    ],
                  ),
                ),
                Text(
                  o.deliveryDate.isEmpty ? 'Sem data' : o.deliveryDate,
                  style: const TextStyle(color: _muted, fontSize: 12),
                ),
              ],
            ),
            const Divider(height: 22),
            ...o.items.map(
              (i) => Padding(
                padding: const EdgeInsets.only(bottom: 5),
                child: Text(
                  '${i.quantity}x  ${i.productName}',
                  style: const TextStyle(color: _ink),
                ),
              ),
            ),
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  _money(o.totalAmount),
                  style: const TextStyle(
                    fontWeight: FontWeight.w900,
                    fontSize: 19,
                    color: _ink,
                  ),
                ),
                Wrap(
                  spacing: 6,
                  children: [
                    ActionChip(
                      label: Text(delivered ? 'Entregue' : 'Produção'),
                      onPressed: () => _production(o),
                      backgroundColor:
                          delivered
                              ? const Color(0xFFEBF2EA)
                              : const Color(0xFFF2E8DF),
                    ),
                    ActionChip(
                      label: Text(paid ? 'Pago' : 'A Receber'),
                      onPressed: () => _payment(o),
                      backgroundColor:
                          paid
                              ? const Color(0xFFEBF2EA)
                              : const Color(0xFFFCEAE8),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext c) => Column(
    children: [
      SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        child: Row(
          children:
              [
                    ('OPEN', 'Em Produção'),
                    ('PAYMENT', 'A Receber'),
                    ('PAID', 'Pagos'),
                    ('ALL', 'Todos'),
                  ]
                  .map(
                    (x) => Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: ChoiceChip(
                        label: Text(x.$2),
                        selected: filter == x.$1,
                        selectedColor: _caramel,
                        labelStyle: TextStyle(
                          color: filter == x.$1 ? Colors.white : _muted,
                        ),
                        onSelected: (_) => setState(() => filter = x.$1),
                      ),
                    ),
                  )
                  .toList(),
        ),
      ),
      if (filter == 'PAYMENT' || filter == 'PAID')
        Container(
          margin: const EdgeInsets.fromLTRB(16, 4, 16, 10),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color:
                filter == 'PAYMENT'
                    ? const Color(0xFFFCEAE8)
                    : const Color(0xFFEBF2EA),
            borderRadius: BorderRadius.circular(18),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(filter == 'PAYMENT' ? 'Falta Receber:' : 'Já Recebido:'),
              Text(
                _money(sumShown),
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ),
      Expanded(
        child:
            loading
                ? const Center(
                  child: CircularProgressIndicator(color: _caramel),
                )
                : RefreshIndicator(
                  onRefresh: _load,
                  child:
                      shown.isEmpty
                          ? ListView(
                            children: [
                              const SizedBox(height: 130),
                              Center(
                                child: Text(
                                  'Nenhum pedido encontrado.',
                                  style: TextStyle(color: _muted),
                                ),
                              ),
                            ],
                          )
                          : ListView.builder(
                            padding: const EdgeInsets.all(16),
                            itemCount: shown.length,
                            itemBuilder: (_, i) => _orderCard(shown[i]),
                          ),
                ),
      ),
    ],
  );
}

class ClientOrdersScreen extends StatefulWidget {
  const ClientOrdersScreen({super.key, required this.client});
  final Client client;
  @override
  State<ClientOrdersScreen> createState() => _ClientOrdersScreenState();
}

class _ClientOrdersScreenState extends State<ClientOrdersScreen> {
  List<CustomerOrder> orders = [];
  bool loading = true;
  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final all = await _api.list('/api/orders', CustomerOrder.fromJson);
      orders =
          all
              .where((o) => o.client?.id == widget.client.id)
              .toList()
              .reversed
              .toList();
    } catch (e) {
      if (mounted) _snack(context, 'Não foi possível carregar os pedidos: $e');
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  Future<void> _toggle(CustomerOrder order) async {
    final value = order.paymentStatus == 'Pago' ? 'A Receber' : 'Pago';
    try {
      await _api.patchOrderStatus(order.id!, paymentStatus: value);
      setState(
        () =>
            orders =
                orders
                    .map(
                      (o) =>
                          o.id == order.id
                              ? CustomerOrder(
                                id: o.id,
                                client: o.client,
                                deliveryDate: o.deliveryDate,
                                totalAmount: o.totalAmount,
                                status: o.status,
                                paymentStatus: value,
                                items: o.items,
                              )
                              : o,
                    )
                    .toList(),
      );
    } catch (e) {
      if (mounted) {
        _snack(context, 'Não foi possível atualizar o pagamento: $e');
      }
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Histórico')),
    body: Column(
      children: [
        Container(
          width: double.infinity,
          color: Colors.white,
          padding: const EdgeInsets.all(18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '👤 ${widget.client.name}',
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                  color: _ink,
                ),
              ),
              const Text(
                'Histórico de Encomendas',
                style: TextStyle(color: _muted),
              ),
            ],
          ),
        ),
        Expanded(
          child:
              loading
                  ? const Center(child: CircularProgressIndicator())
                  : orders.isEmpty
                  ? const Center(
                    child: Text('Nenhum pedido lançado para este cliente.'),
                  )
                  : RefreshIndicator(
                    onRefresh: _load,
                    child: ListView(
                      padding: const EdgeInsets.all(16),
                      children:
                          orders
                              .map(
                                (o) => Card(
                                  color: Colors.white,
                                  child: Padding(
                                    padding: const EdgeInsets.all(16),
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'Pedido #${o.id}  •  ${o.deliveryDate.isEmpty ? 'Sem data' : o.deliveryDate}',
                                          style: const TextStyle(
                                            fontWeight: FontWeight.bold,
                                            color: _ink,
                                          ),
                                        ),
                                        ...o.items.map(
                                          (i) => Text(
                                            '${i.quantity}x ${i.productName}',
                                          ),
                                        ),
                                        Row(
                                          mainAxisAlignment:
                                              MainAxisAlignment.spaceBetween,
                                          children: [
                                            Text(
                                              _money(o.totalAmount),
                                              style: const TextStyle(
                                                fontSize: 18,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                            TextButton(
                                              onPressed: () => _toggle(o),
                                              child: Text(
                                                o.paymentStatus == 'Pago'
                                                    ? 'Pago'
                                                    : 'A Receber',
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              )
                              .toList(),
                    ),
                  ),
        ),
      ],
    ),
    floatingActionButton:
        widget.client.active
            ? FloatingActionButton(
              backgroundColor: _caramel,
              foregroundColor: Colors.white,
              onPressed: () async {
                final changed = await Navigator.push<bool>(
                  context,
                  MaterialPageRoute(
                    builder: (_) => OrderForm(client: widget.client),
                  ),
                );
                if (changed == true) _load();
              },
              child: const Icon(Icons.add),
            )
            : null,
  );
}

class OrderForm extends StatefulWidget {
  const OrderForm({super.key, required this.client});
  final Client client;
  @override
  State<OrderForm> createState() => _OrderFormState();
}

class _OrderLine {
  int? productId;
  final quantity = TextEditingController(text: '1');
}

class _OrderFormState extends State<OrderForm> {
  final delivery = TextEditingController();
  final lines = [_OrderLine()];
  List<Product> products = [];
  bool loading = true, busy = false;
  @override
  void initState() {
    super.initState();
    _loadProducts();
  }

  Future<void> _loadProducts() async {
    try {
      products = await _api.list('/api/products', Product.fromJson);
    } catch (e) {
      if (mounted) {
        _snack(context, 'Não foi possível carregar produtos: $e');
      }
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  void dispose() {
    delivery.dispose();
    for (final l in lines) {
      l.quantity.dispose();
    }
    super.dispose();
  }

  Future<void> save() async {
    final valid =
        lines
            .where(
              (l) =>
                  l.productId != null &&
                  (int.tryParse(l.quantity.text) ?? 0) > 0,
            )
            .toList();
    if (valid.isEmpty) {
      _snack(context, 'Adicione pelo menos um produto válido ao pedido.');
      return;
    }
    setState(() => busy = true);
    try {
      await _api.postRaw('/api/orders', {
        'client': {'id': widget.client.id},
        'deliveryDate': delivery.text.trim(),
        'paymentStatus': 'A Receber',
        'status': 'Pendente',
        'items':
            valid
                .map(
                  (l) => {
                    'product': {'id': l.productId},
                    'quantity': int.parse(l.quantity.text),
                  },
                )
                .toList(),
      });
      if (mounted) Navigator.pop(context, true);
    } catch (e) {
      if (mounted) _snack(context, 'Não foi possível salvar o pedido: $e');
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext c) => Scaffold(
    appBar: AppBar(title: const Text('Novo Pedido')),
    body:
        loading
            ? const Center(child: CircularProgressIndicator())
            : ListView(
              padding: const EdgeInsets.all(20),
              children: [
                Card(
                  color: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        _field(
                          'Data e Hora de Entrega (Opcional)',
                          delivery,
                          hint: 'Ex: 25/12/2026 às 14:00',
                        ),
                        const Text(
                          'Itens do Pedido',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: _ink,
                          ),
                        ),
                        ...lines.map(
                          (l) => Row(
                            children: [
                              Expanded(
                                flex: 3,
                                child: DropdownButtonFormField<int>(
                                  value: l.productId,
                                  decoration: const InputDecoration(
                                    labelText: 'Caixa/Doce',
                                  ),
                                  items:
                                      products
                                          .map(
                                            (p) => DropdownMenuItem(
                                              value: p.id,
                                              child: Text(
                                                '${p.name} (${_money(p.salePrice)})',
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                            ),
                                          )
                                          .toList(),
                                  onChanged:
                                      (x) => setState(() => l.productId = x),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: TextField(
                                  controller: l.quantity,
                                  keyboardType: TextInputType.number,
                                  decoration: const InputDecoration(
                                    labelText: 'Qtd',
                                  ),
                                ),
                              ),
                              IconButton(
                                onPressed:
                                    lines.length == 1
                                        ? null
                                        : () => setState(() => lines.remove(l)),
                                icon: const Icon(Icons.remove_circle_outline),
                              ),
                            ],
                          ),
                        ),
                        TextButton.icon(
                          onPressed:
                              () => setState(() => lines.add(_OrderLine())),
                          icon: const Icon(Icons.add),
                          label: const Text('Adicionar produto'),
                        ),
                        const SizedBox(height: 16),
                        FilledButton(
                          onPressed: busy ? null : save,
                          style: FilledButton.styleFrom(
                            backgroundColor: _caramel,
                          ),
                          child:
                              busy
                                  ? const CircularProgressIndicator(
                                    color: Colors.white,
                                  )
                                  : const Text('Salvar Pedido'),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
  );
}
