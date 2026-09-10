package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Entity
@Table(name = "tb_recipe_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecipeItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "recipe_id", nullable = false)
    @JsonBackReference // Esconde o "pai" (Recipe) no JSON para não entrar em loop infinito
    private Recipe recipe;

    @ManyToOne
    @JoinColumn(name = "ingredient_id", nullable = false)
    private Ingredient ingredient;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantityUsed; // Ex: 395 (gramas)

    @Column(precision = 10, scale = 2)
    private BigDecimal calculatedCost; // Custo proporcional. Ex: R$ 6.50

    // Calcula o custo do item baseado na quantidade usada * custo unitário do insumo
    @PrePersist
    @PreUpdate
    public void calculateItemCost() {
        if (this.ingredient != null && this.ingredient.getUnitCost() != null && this.quantityUsed != null) {
            this.calculatedCost = this.quantityUsed.multiply(this.ingredient.getUnitCost())
                    .setScale(2, RoundingMode.HALF_UP);
        }
    }
}