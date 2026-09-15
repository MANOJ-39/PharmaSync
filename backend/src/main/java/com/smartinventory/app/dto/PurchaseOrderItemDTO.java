package com.smartinventory.app.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderItemDTO {
    private Long id;

    @NotNull
    private Long productId;
    private String productName;
    private String productSku;

    @NotNull
    @Min(1)
    private Integer quantity;

    @NotNull
    private BigDecimal unitPrice;

    private BigDecimal subtotal;
}
