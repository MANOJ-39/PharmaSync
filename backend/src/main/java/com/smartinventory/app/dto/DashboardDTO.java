package com.smartinventory.app.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class DashboardDTO {
    private long totalProducts;
    private long activeSuppliers;
    private long totalInventoryUnits;
    private BigDecimal totalInventoryValue;
    
    private long lowStockProducts;
    private long expiringWithin7Days;
    private long expiredBatches;
    private long pendingReorders;
}
