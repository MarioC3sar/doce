package com.example.demo.dto;

import java.math.BigDecimal;

public record PricingResponse(
        String recipeName,
        BigDecimal panCost,          // Custo total da receita
        Integer yield,               // Quantas unidades rende
        BigDecimal unitCost,         // Custo de fabricação de 1 unidade
        BigDecimal marginPercentage, // Margem de lucro aplicada (%)
        BigDecimal suggestedPrice    // Preço sugerido de venda da unidade
) {}