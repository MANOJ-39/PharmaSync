package com.smartinventory.app.service;

import com.smartinventory.app.dto.DashboardDTO;
import com.smartinventory.app.entity.Batch;
import com.smartinventory.app.repository.BatchRepository;
import com.smartinventory.app.repository.ProductRepository;
import com.smartinventory.app.repository.ReorderSuggestionRepository;
import com.smartinventory.app.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final BatchRepository batchRepository;
    private final ReorderSuggestionRepository reorderSuggestionRepository;

    public DashboardDTO getDashboardStats() {
        LocalDate today = LocalDate.now();
        List<Batch> allBatches = batchRepository.findAll();

        long totalUnits = 0;
        BigDecimal totalValue = BigDecimal.ZERO;
        long expiredBatchesCount = 0;
        long expiring7DaysCount = 0;

        for (Batch b : allBatches) {
            if (b.getAvailableQuantity() > 0) {
                totalUnits += b.getAvailableQuantity();
                totalValue = totalValue.add(b.getUnitCost().multiply(BigDecimal.valueOf(b.getAvailableQuantity())));
                
                if (b.getExpiryDate().isBefore(today) || b.getExpiryDate().isEqual(today)) {
                    expiredBatchesCount++;
                } else if (b.getExpiryDate().isBefore(today.plusDays(7))) {
                    expiring7DaysCount++;
                }
            }
        }

        return DashboardDTO.builder()
                .totalProducts(productRepository.count())
                .activeSuppliers(supplierRepository.findByActiveTrue().size())
                .totalInventoryUnits(totalUnits)
                .totalInventoryValue(totalValue)
                .lowStockProducts(reorderSuggestionRepository.findByStatusOrderByCreatedAtDesc("PENDING").stream()
                        .map(r -> r.getProduct().getId())
                        .distinct()
                        .count())
                .expiringWithin7Days(expiring7DaysCount)
                .expiredBatches(expiredBatchesCount)
                .pendingReorders(reorderSuggestionRepository.findByStatusOrderByCreatedAtDesc("PENDING").size())
                .build();
    }
}
