package com.example.demo.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Entity
@Table(name = "tb_ingredients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ingredient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal packagePrice;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal packageQuantity;

    @Column(nullable = false, length = 10)
    private String unit;

    @Column(precision = 10, scale = 4)
    private BigDecimal unitCost;

    @PrePersist
    @PreUpdate
    public void calculateUnitCost() {
        if (this.packagePrice != null && this.packageQuantity != null && this.packageQuantity.compareTo(BigDecimal.ZERO) > 0) {
            this.unitCost = this.packagePrice.divide(this.packageQuantity, 4, RoundingMode.HALF_UP);
        }
    }
}