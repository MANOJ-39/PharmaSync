package com.smartinventory.app.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryTransactionDTO {
    private Long id;
    private Long productId;
    private String productName;
    private Long batchId;
    private String batchNumber;
    private String type;
    private Integer quantity;
    private String referenceId;
    private String username;
    private String notes;
    private LocalDateTime timestamp;
}
