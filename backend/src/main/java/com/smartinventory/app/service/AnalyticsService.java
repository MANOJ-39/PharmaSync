package com.smartinventory.app.service;

import com.smartinventory.app.dto.AnalyticsDTO;
import com.smartinventory.app.entity.InventoryTransaction;
import com.smartinventory.app.entity.TransactionType;
import com.smartinventory.app.repository.InventoryTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsService {
    
    private final InventoryTransactionRepository transactionRepository;

    public AnalyticsDTO getAnalytics() {
        List<InventoryTransaction> transactions = transactionRepository.findAll();

        BigDecimal totalInletCost = BigDecimal.ZERO;
        BigDecimal totalOutletRevenue = BigDecimal.ZERO;
        long totalItemsIn = 0;
        long totalItemsOut = 0;

        Map<String, BigDecimal[]> categoryAgg = new HashMap<>(); // [inlet, outlet]

        for (InventoryTransaction t : transactions) {
            String catName = t.getProduct().getCategory() != null ? t.getProduct().getCategory().getName() : "General";
            categoryAgg.putIfAbsent(catName, new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});

            if (t.getType() == TransactionType.IN) {
                totalItemsIn += t.getQuantity();
                BigDecimal cost = t.getProduct().getCostPrice().multiply(BigDecimal.valueOf(t.getQuantity()));
                totalInletCost = totalInletCost.add(cost);
                categoryAgg.get(catName)[0] = categoryAgg.get(catName)[0].add(cost);
            } else if (t.getType() == TransactionType.OUT) {
                totalItemsOut += t.getQuantity();
                BigDecimal revenue = t.getProduct().getSellingPrice().multiply(BigDecimal.valueOf(t.getQuantity()));
                totalOutletRevenue = totalOutletRevenue.add(revenue);
                categoryAgg.get(catName)[1] = categoryAgg.get(catName)[1].add(revenue);
            }
        }

        List<AnalyticsDTO.ChartDataPoint> chartData = new ArrayList<>();
        for (Map.Entry<String, BigDecimal[]> entry : categoryAgg.entrySet()) {
            chartData.add(AnalyticsDTO.ChartDataPoint.builder()
                    .name(entry.getKey())
                    .inlet(entry.getValue()[0])
                    .outlet(entry.getValue()[1])
                    .build());
        }

        return AnalyticsDTO.builder()
                .totalInletCost(totalInletCost)
                .totalOutletRevenue(totalOutletRevenue)
                .totalItemsIn(totalItemsIn)
                .totalItemsOut(totalItemsOut)
                .chartData(chartData)
                .build();
    }
}
