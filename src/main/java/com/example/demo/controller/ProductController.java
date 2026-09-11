package com.example.demo.controller; // Ajuste para o seu pacote

import com.example.demo.model.*;
import com.example.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private RecipeRepository recipeRepository; // Para buscar o custo do doce

    @Autowired
    private IngredientRepository ingredientRepository; // Para buscar o custo da embalagem

    // 1. Listar todos os produtos (Caixas)
    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 2. Buscar um produto específico
    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        // Inicializa o custo total em zero usando BigDecimal
        java.math.BigDecimal calculatedTotalCost = java.math.BigDecimal.ZERO;

        // A. Amarra as Receitas (Doces) ao Produto e calcula o custo
        if (product.getRecipes() != null) {
            for (ProductRecipeItem item : product.getRecipes()) {
                item.setProduct(product);

                Recipe recipeDB = recipeRepository.findById(item.getRecipe().getId()).orElseThrow();

                // Converte o rendimento (Integer) para BigDecimal
                java.math.BigDecimal yieldBd = new java.math.BigDecimal(recipeDB.getYield());

                // Custo Unitário = Custo da Panela / Rendimento (com arredondamento de 4 casas)
                java.math.BigDecimal unitCost = recipeDB.getTotalCost().divide(yieldBd, 4, java.math.RoundingMode.HALF_UP);

                // Multiplica pela quantidade que vai na caixa
                java.math.BigDecimal itemTotal = unitCost.multiply(new java.math.BigDecimal(item.getQuantity()));

                // Soma ao custo total da caixa
                calculatedTotalCost = calculatedTotalCost.add(itemTotal);
            }
        }

        // B. Amarra os Insumos (Embalagens) ao Produto e calcula o custo
        if (product.getIngredients() != null) {
            for (ProductIngredientItem item : product.getIngredients()) {
                item.setProduct(product);

                Ingredient ingredientDB = ingredientRepository.findById(item.getIngredient().getId()).orElseThrow();

                // Custo Unitário do insumo
                java.math.BigDecimal unitCost = ingredientDB.getPackagePrice().divide(ingredientDB.getPackageQuantity(), 4, java.math.RoundingMode.HALF_UP);

                // Multiplica pela quantidade usada (garantindo que vira BigDecimal)
                java.math.BigDecimal quantityUsedBd = java.math.BigDecimal.valueOf(item.getQuantityUsed());
                java.math.BigDecimal itemTotal = unitCost.multiply(quantityUsedBd);

                // Soma ao custo total da caixa
                calculatedTotalCost = calculatedTotalCost.add(itemTotal);
            }
        }

        // C. Salva o custo total calculado no produto e grava no banco
        // Certifique-se de que o totalCost na classe Product seja do tipo BigDecimal!
        product.setTotalCost(calculatedTotalCost);
        Product savedProduct = productRepository.save(product);

        return ResponseEntity.ok(savedProduct);
    }

    // 4. Atualizar Produto
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product productDetails) {
        return productRepository.findById(id).map(existingProduct -> {
            existingProduct.setName(productDetails.getName());
            existingProduct.setSalePrice(productDetails.getSalePrice());

            // Limpa as listas antigas para o Hibernate deletar do banco (graças ao orphanRemoval=true)
            existingProduct.getRecipes().clear();
            existingProduct.getIngredients().clear();

            java.math.BigDecimal calculatedTotalCost = java.math.BigDecimal.ZERO;

            // Recalcula as Receitas
            if (productDetails.getRecipes() != null) {
                for (ProductRecipeItem item : productDetails.getRecipes()) {
                    item.setProduct(existingProduct);
                    Recipe recipeDB = recipeRepository.findById(item.getRecipe().getId())
                            .orElseThrow(() -> new RuntimeException("Receita não encontrada!"));

                    java.math.BigDecimal yieldBd = new java.math.BigDecimal(recipeDB.getYield());
                    java.math.BigDecimal unitCost = recipeDB.getTotalCost().divide(yieldBd, 4, java.math.RoundingMode.HALF_UP);
                    java.math.BigDecimal itemTotal = unitCost.multiply(new java.math.BigDecimal(item.getQuantity()));

                    calculatedTotalCost = calculatedTotalCost.add(itemTotal);
                    existingProduct.getRecipes().add(item);
                }
            }

            // Recalcula os Insumos
            if (productDetails.getIngredients() != null) {
                for (ProductIngredientItem item : productDetails.getIngredients()) {
                    item.setProduct(existingProduct);
                    Ingredient ingredientDB = ingredientRepository.findById(item.getIngredient().getId())
                            .orElseThrow(() -> new RuntimeException("Insumo não encontrado!"));

                    java.math.BigDecimal unitCost = ingredientDB.getPackagePrice().divide(ingredientDB.getPackageQuantity(), 4, java.math.RoundingMode.HALF_UP);
                    java.math.BigDecimal quantityUsedBd = java.math.BigDecimal.valueOf(item.getQuantityUsed());
                    java.math.BigDecimal itemTotal = unitCost.multiply(quantityUsedBd);

                    calculatedTotalCost = calculatedTotalCost.add(itemTotal);
                    existingProduct.getIngredients().add(item);
                }
            }

            existingProduct.setTotalCost(calculatedTotalCost);
            return ResponseEntity.ok(productRepository.save(existingProduct));
        }).orElse(ResponseEntity.notFound().build());
    }

    // 5. Excluir Produto
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }}