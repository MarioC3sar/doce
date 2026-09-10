package com.example.demo.controller;

import com.example.demo.model.Ingredient;
import com.example.demo.repository.IngredientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ingredients")
public class IngredientController {

    @Autowired
    private IngredientRepository ingredientRepository;

    @PostMapping
    public ResponseEntity<Ingredient> create(@RequestBody Ingredient ingredient) {
        // O cálculo do custo unitário (calculateUnitCost) será chamado automaticamente pelo @PrePersist que configuramos no Model
        Ingredient savedIngredient = ingredientRepository.save(ingredient);
        return ResponseEntity.ok(savedIngredient);
    }

    @GetMapping
    public ResponseEntity<List<Ingredient>> listAll() {
        return ResponseEntity.ok(ingredientRepository.findAll());
    }
    @PutMapping("/{id}")
    public ResponseEntity<Ingredient> update(@PathVariable Long id, @RequestBody Ingredient ingredientDetails) {
        return ingredientRepository.findById(id).map(ingredient -> {
            ingredient.setName(ingredientDetails.getName());
            ingredient.setPackagePrice(ingredientDetails.getPackagePrice());
            ingredient.setPackageQuantity(ingredientDetails.getPackageQuantity());
            ingredient.setUnit(ingredientDetails.getUnit());

            // O custo unitário será recalculado automaticamente antes do save
            return ResponseEntity.ok(ingredientRepository.save(ingredient));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (ingredientRepository.existsById(id)) {
            ingredientRepository.deleteById(id);
            return ResponseEntity.noContent().build(); // Retorna 204 sem conteúdo
        }
        return ResponseEntity.notFound().build();
    }
}