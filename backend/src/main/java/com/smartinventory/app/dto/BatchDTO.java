package com.smartinventory.app.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchDTO {
    private Long id;

    @NotBlank(message = "Batch number is required")
    private String batchNumber;

    @NotNull(message = "Product ID is required")
    private Long productId;
    private String productName;

    private Long supplierId;
    private String supplierName;

    @NotNull(message = "Manufacturing date is required")
    private LocalDate manufacturingDate;

    @NotNull(message = "Expiry date is required")
    private LocalDate expiryDate;

    @NotNull(message = "Received quantity is required")
    @Min(value = 1, message = "Received quantity must be at least 1")
    private Integer receivedQuantity;

    private Integer availableQuantity;

    @NotNull(message = "Unit cost is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Unit cost must be greater than zero")
    private BigDecimal unitCost;

    private String status;
}
