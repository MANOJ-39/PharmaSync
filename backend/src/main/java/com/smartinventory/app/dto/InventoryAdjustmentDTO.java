package com.smartinventory.app.dto;

import com.smartinventory.app.entity.AdjustmentReason;
import jakarta.validation.constraints.Min;
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
public class InventoryAdjustmentDTO {
    private Long id;

    @NotNull
    private Long productId;
    private String productName;

    @NotNull
    private Long batchId;
    private String batchNumber;

    @NotNull
    private Integer quantityAdjusted;

    @NotNull
    private AdjustmentReason reason;

    private String notes;

    private String adjustedBy;

    private LocalDateTime createdAt;
}
