import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_flutter/models/models.dart';

void main() {
  test('ingredient model maps backend JSON and request shape', () {
    final ingredient = Ingredient.fromJson({
      'id': 4,
      'name': 'Chocolate',
      'packagePrice': 12.50,
      'packageQuantity': 1000,
      'unit': 'g',
      'unitCost': 0.0125,
    });

    expect(ingredient.id, 4);
    expect(ingredient.unitCost, 0.0125);
    expect(ingredient.toJson(), {
      'name': 'Chocolate',
      'packagePrice': 12.5,
      'packageQuantity': 1000,
      'unit': 'g',
    });
  });

  test('order parser reads nested client and product data', () {
    final order = CustomerOrder.fromJson({
      'id': 8,
      'client': {'id': 3, 'name': 'Ana', 'phone': '123', 'address': 'Rua A'},
      'deliveryDate': '25/12/2026 às 14:00',
      'totalAmount': 42.5,
      'status': 'Pendente',
      'paymentStatus': 'A Receber',
      'items': [
        {
          'quantity': 2,
          'unitPrice': 21.25,
          'product': {'id': 5, 'name': 'Caixa sortida'},
        },
      ],
    });

    expect(order.client?.name, 'Ana');
    expect(order.items.single.productName, 'Caixa sortida');
    expect(order.items.single.quantity, 2);
    expect(order.totalAmount, 42.5);
  });

  test(
    'client model treats legacy records as active and reads archived state',
    () {
      final legacyClient = Client.fromJson({'id': 2, 'name': 'Ana'});
      final archivedClient = Client.fromJson({
        'id': 3,
        'name': 'Bia',
        'active': false,
      });

      expect(legacyClient.active, isTrue);
      expect(archivedClient.active, isFalse);
    },
  );
}
