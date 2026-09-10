package com.example.demo.controller;

import com.example.demo.model.Ingredient;
import com.example.demo.model.Recipe;
import com.example.demo.model.RecipeItem;
import com.example.demo.repository.IngredientRepository;
import com.example.demo.repository.RecipeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/recipes")
public class RecipeController {

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private IngredientRepository ingredientRepository;

    @PostMapping
    public ResponseEntity<Recipe> create(@RequestBody Recipe recipe) {
        BigDecimal totalCost = BigDecimal.ZERO;

        // Percorre os itens da receita para amarrar os dados e calcular valores
        for (RecipeItem item : recipe.getItems()) {

            // 1. Informa ao item quem é o "pai" dele (para a chave estrangeira funcionar)
            item.setRecipe(recipe);

            // 2. Busca o ingrediente real no banco de dados pelo ID enviado no JSON
            Ingredient ingredient = ingredientRepository.findById(item.getIngredient().getId())
                    .orElseThrow(() -> new RuntimeException("Ingrediente não encontrado: " + item.getIngredient().getId()));

            item.setIngredient(ingredient);

            // 3. Força o cálculo do custo do item baseado na quantidade usada
            item.calculateItemCost();

            // 4. Soma esse custo ao valor total da panela
            totalCost = totalCost.add(item.getCalculatedCost());
        }

        // Salva o valor total da receita
        recipe.setTotalCost(totalCost);

        // Salva tudo no banco (a receita e os itens em cascata)
        Recipe savedRecipe = recipeRepository.save(recipe);

        return ResponseEntity.ok(savedRecipe);
    }

    @GetMapping
    public ResponseEntity<List<Recipe>> listAll() {
        return ResponseEntity.ok(recipeRepository.findAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Recipe> update(@PathVariable Long id, @RequestBody Recipe recipeDetails) {
        return recipeRepository.findById(id).map(existingRecipe -> {
            existingRecipe.setName(recipeDetails.getName());
            existingRecipe.setYield(recipeDetails.getYield());

            // Limpa os itens antigos para substituir pelos novos
            existingRecipe.getItems().clear();

            BigDecimal totalCost = BigDecimal.ZERO;

            for (RecipeItem item : recipeDetails.getItems()) {
                item.setRecipe(existingRecipe);

                Ingredient ingredient = ingredientRepository.findById(item.getIngredient().getId())
                        .orElseThrow(() -> new RuntimeException("Ingrediente não encontrado: " + item.getIngredient().getId()));

                item.setIngredient(ingredient);
                item.calculateItemCost();
                totalCost = totalCost.add(item.getCalculatedCost());

                existingRecipe.getItems().add(item);
            }

            existingRecipe.setTotalCost(totalCost);
            return ResponseEntity.ok(recipeRepository.save(existingRecipe));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (recipeRepository.existsById(id)) {
            recipeRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/pricing")
    public ResponseEntity<com.example.demo.dto.PricingResponse> getSuggestedPricing(
            @PathVariable Long id,
            @RequestParam(defaultValue = "100") BigDecimal margin) { // Margem padrão de 100% se não for enviada

        return recipeRepository.findById(id).map(recipe -> {
            if (recipe.getYield() == null || recipe.getYield() <= 0) {
                throw new RuntimeException("O rendimento da receita deve ser maior que zero para calcular o preço unitário.");
            }

            // 1. Descobre o custo de 1 único doce (Custo Total / Rendimento)
            BigDecimal yieldDecimal = new BigDecimal(recipe.getYield());
            BigDecimal unitCost = recipe.getTotalCost().divide(yieldDecimal, 2, java.math.RoundingMode.HALF_UP);

            // 2. Calcula o valor financeiro do lucro: custoUnitario * (margem / 100)
            BigDecimal marginMultiplier = margin.divide(new BigDecimal("100"), 4, java.math.RoundingMode.HALF_UP);
            BigDecimal profitValue = unitCost.multiply(marginMultiplier);

            // 3. Soma o custo com o lucro para obter o Preço Sugerido
            BigDecimal suggestedPrice = unitCost.add(profitValue).setScale(2, java.math.RoundingMode.HALF_UP);

            // 4. Monta a resposta usando o Record que criamos
            com.example.demo.dto.PricingResponse response = new com.example.demo.dto.PricingResponse(
                    recipe.getName(),
                    recipe.getTotalCost(),
                    recipe.getYield(),
                    unitCost,
                    margin,
                    suggestedPrice
            );

            return ResponseEntity.ok(response);
        }).orElse(ResponseEntity.notFound().build());
    }
    @GetMapping("/{id}")
    public ResponseEntity<Recipe> getRecipeById(@PathVariable Long id) {
        return recipeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}