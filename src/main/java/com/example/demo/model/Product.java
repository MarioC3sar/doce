package com.example.demo.model; // Ajuste para o seu pacote

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private BigDecimal salePrice; // Opcional: Preço de venda que você vai cobrar

    private BigDecimal totalCost; // O custo somado das receitas + embalagens

    // Lista de Receitas (os doces que vão dentro da caixa)
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductRecipeItem> recipes = new ArrayList<>();

    // Lista de Insumos diretos (a embalagem, forminhas, laços)
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductIngredientItem> ingredients = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getSalePrice() {
        return salePrice;
    }

    public void setSalePrice(BigDecimal salePrice) {
        this.salePrice = salePrice;
    }

    public BigDecimal getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(BigDecimal totalCost) {
        this.totalCost = totalCost;
    }

    public List<ProductRecipeItem> getRecipes() {
        return recipes;
    }

    public void setRecipes(List<ProductRecipeItem> recipes) {
        this.recipes = recipes;
    }

    public List<ProductIngredientItem> getIngredients() {
        return ingredients;
    }

    public void setIngredients(List<ProductIngredientItem> ingredients) {
        this.ingredients = ingredients;
    }

    // Gere os Getters e Setters aqui...
}