package com.smartinventory.app.dto;

import com.smartinventory.app.entity.PurchaseOrderStatus;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderDTO {
    private Long id;
    
    private String poNumber;

    @NotNull
    private Long supplierId;
    private String supplierName;

    private PurchaseOrderStatus status;
    private BigDecimal totalAmount;

    @NotEmpty
    private List<PurchaseOrderItemDTO> items;

    private String notes;
    private String createdBy;
    private LocalDateTime createdAt;
}
