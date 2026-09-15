package com.smartinventory.app.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class AnalyticsDTO {
    private BigDecimal totalInletCost;
    private BigDecimal totalOutletRevenue;
    private long totalItemsIn;
    private long totalItemsOut;
    private List<ChartDataPoint> chartData;

    @Data
    @Builder
    public static class ChartDataPoint {
        private String name; // e.g. Product Name or Category
        private BigDecimal inlet;
        private BigDecimal outlet;
    }
}
