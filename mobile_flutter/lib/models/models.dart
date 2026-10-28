typedef Json = Map<String, dynamic>;

double _number(dynamic value) => (value as num?)?.toDouble() ?? 0;
int _integer(dynamic value) => (value as num?)?.toInt() ?? 0;

class Ingredient {
  const Ingredient({
    this.id,
    required this.name,
    required this.packagePrice,
    required this.packageQuantity,
    required this.unit,
    this.unitCost = 0,
  });
  final int? id;
  final String name;
  final double packagePrice, packageQuantity, unitCost;
  final String unit;
  factory Ingredient.fromJson(Json j) => Ingredient(
    id: j['id'] as int?,
    name: j['name'] ?? '',
    packagePrice: _number(j['packagePrice']),
    packageQuantity: _number(j['packageQuantity']),
    unit: j['unit'] ?? '',
    unitCost: _number(j['unitCost']),
  );
  Json toJson({bool includeId = false}) => {
    if (includeId && id != null) 'id': id,
    'name': name,
    'packagePrice': packagePrice,
    'packageQuantity': packageQuantity,
    'unit': unit,
  };
}

class RecipeItem {
  const RecipeItem({
    this.id,
    required this.ingredient,
    required this.quantityUsed,
    this.calculatedCost = 0,
  });
  final int? id;
  final Ingredient ingredient;
  final double quantityUsed, calculatedCost;
  factory RecipeItem.fromJson(Json j) => RecipeItem(
    id: j['id'] as int?,
    ingredient: Ingredient.fromJson(
      Map<String, dynamic>.from(j['ingredient'] ?? {}),
    ),
    quantityUsed: _number(j['quantityUsed']),
    calculatedCost: _number(j['calculatedCost']),
  );
  Json toJson() => {
    'ingredient': {'id': ingredient.id},
    'quantityUsed': quantityUsed,
  };
}

class Recipe {
  const Recipe({
    this.id,
    required this.name,
    required this.yieldCount,
    this.totalCost = 0,
    this.items = const [],
  });
  final int? id;
  final String name;
  final int yieldCount;
  final double totalCost;
  final List<RecipeItem> items;
  factory Recipe.fromJson(Json j) => Recipe(
    id: j['id'] as int?,
    name: j['name'] ?? '',
    yieldCount: _integer(j['yield']),
    totalCost: _number(j['totalCost']),
    items:
        ((j['items'] as List?) ?? [])
            .map((e) => RecipeItem.fromJson(Map<String, dynamic>.from(e)))
            .toList(),
  );
  Json toJson() => {
    'name': name,
    'yield': yieldCount,
    'items': items.map((e) => e.toJson()).toList(),
  };
}

class ProductRecipeItem {
  const ProductRecipeItem({required this.recipeId, required this.quantity});
  final int recipeId, quantity;
  Json toJson() => {
    'recipe': {'id': recipeId},
    'quantity': quantity,
  };
}

class ProductIngredientItem {
  const ProductIngredientItem({
    required this.ingredientId,
    required this.quantityUsed,
  });
  final int ingredientId;
  final double quantityUsed;
  Json toJson() => {
    'ingredient': {'id': ingredientId},
    'quantityUsed': quantityUsed,
  };
}

class Product {
  const Product({
    this.id,
    required this.name,
    required this.salePrice,
    this.totalCost = 0,
    this.recipes = const [],
    this.ingredients = const [],
  });
  final int? id;
  final String name;
  final double salePrice, totalCost;
  final List<ProductRecipeItem> recipes;
  final List<ProductIngredientItem> ingredients;
  factory Product.fromJson(Json j) => Product(
    id: j['id'] as int?,
    name: j['name'] ?? '',
    salePrice: _number(j['salePrice']),
    totalCost: _number(j['totalCost']),
    recipes:
        ((j['recipes'] as List?) ?? []).map((e) {
          final m = Map<String, dynamic>.from(e);
          return ProductRecipeItem(
            recipeId: _integer(m['recipe']?['id']),
            quantity: _integer(m['quantity']),
          );
        }).toList(),
    ingredients:
        ((j['ingredients'] as List?) ?? []).map((e) {
          final m = Map<String, dynamic>.from(e);
          return ProductIngredientItem(
            ingredientId: _integer(m['ingredient']?['id']),
            quantityUsed: _number(m['quantityUsed']),
          );
        }).toList(),
  );
  Json toJson() => {
    'name': name,
    'salePrice': salePrice,
    'recipes': recipes.map((e) => e.toJson()).toList(),
    'ingredients': ingredients.map((e) => e.toJson()).toList(),
  };
}

class Client {
  const Client({
    this.id,
    required this.name,
    this.phone = '',
    this.address = '',
    this.active = true,
  });
  final int? id;
  final String name, phone, address;
  final bool active;
  factory Client.fromJson(Json j) => Client(
    id: j['id'] as int?,
    name: j['name'] ?? '',
    phone: j['phone'] ?? '',
    address: j['address'] ?? '',
    active: j['active'] as bool? ?? true,
  );
  Json toJson() => {'name': name, 'phone': phone, 'address': address};
}

class OrderItem {
  const OrderItem({
    this.id,
    this.productName = '',
    this.productId,
    this.quantity = 0,
    this.unitPrice = 0,
  });
  final int? id, productId;
  final String productName;
  final int quantity;
  final double unitPrice;
  factory OrderItem.fromJson(Json j) => OrderItem(
    id: j['id'] as int?,
    productId: j['product']?['id'] as int?,
    productName: j['product']?['name'] ?? '',
    quantity: _integer(j['quantity']),
    unitPrice: _number(j['unitPrice']),
  );
}

class CustomerOrder {
  const CustomerOrder({
    this.id,
    this.client,
    this.deliveryDate = '',
    this.totalAmount = 0,
    this.status = '',
    this.paymentStatus = '',
    this.items = const [],
  });
  final int? id;
  final Client? client;
  final String deliveryDate, status, paymentStatus;
  final double totalAmount;
  final List<OrderItem> items;
  factory CustomerOrder.fromJson(Json j) => CustomerOrder(
    id: j['id'] as int?,
    client:
        j['client'] == null
            ? null
            : Client.fromJson(Map<String, dynamic>.from(j['client'])),
    deliveryDate: j['deliveryDate'] ?? '',
    totalAmount: _number(j['totalAmount']),
    status: j['status'] ?? '',
    paymentStatus: j['paymentStatus'] ?? '',
    items:
        ((j['items'] as List?) ?? [])
            .map((e) => OrderItem.fromJson(Map<String, dynamic>.from(e)))
            .toList(),
  );
}
