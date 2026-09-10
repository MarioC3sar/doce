package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tb_recipes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // Ex: Massa de Brigadeiro Tradicional

    @Column(nullable = false)
    private Integer yield; // Rendimento. Ex: rende 30 brigadeiros (bolinhas)

    @Column(precision = 10, scale = 2)
    private BigDecimal totalCost; // Custo somado de todos os insumos da panela

    // Uma receita tem vários itens. O CascadeType.ALL permite salvar a receita e os itens juntos.
    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference // Permite que a lista apareça no JSON sem dar loop
    private List<RecipeItem> items = new ArrayList<>();
}