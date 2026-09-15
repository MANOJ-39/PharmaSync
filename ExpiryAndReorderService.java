package com.smartinventory.app.service;

import com.smartinventory.app.entity.Batch;
import com.smartinventory.app.entity.Notification;
import com.smartinventory.app.entity.Product;
import com.smartinventory.app.entity.ReorderSuggestion;
import com.smartinventory.app.repository.BatchRepository;
import com.smartinventory.app.repository.NotificationRepository;
import com.smartinventory.app.repository.ProductRepository;
import com.smartinventory.app.repository.ReorderSuggestionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExpiryAndReorderService {

    private final BatchRepository batchRepository;
    private final ProductRepository productRepository;
    private final NotificationRepository notificationRepository;
    private final ReorderSuggestionRepository reorderSuggestionRepository;

    // Runs every day at 00:01 AM
    // @Scheduled(cron = "0 1 0 * * ?")
    // For testing purposes, we'll run it every 5 minutes
    @Scheduled(fixedRate = 5000)
    @Transactional
    public void monitorExpiry() {
        log.info("Running scheduled Expiry Monitoring Job");
        LocalDate today = LocalDate.now();

        // Find EXPIRED
        List<Batch> expiredBatches = batchRepository.findByExpiryDateBeforeAndAvailableQuantityGreaterThan(today, 0);
        for (Batch b : expiredBatches) {
            if (!"EXPIRED".equals(b.getStatus())) {
                b.setStatus("EXPIRED");
                batchRepository.save(b);
                notificationRepository.save(Notification.builder()
                        .type("EXPIRED")
                        .message("Batch " + b.getBatchNumber() + " of product " + b.getProduct().getName() + " has expired with " + b.getAvailableQuantity() + " units remaining.")
                        .severity("CRITICAL")
                        .read(false)
                        .build());
            }
        }

        // Find EXPIRING_WITHIN_7_DAYS
        List<Batch> expiring7 = batchRepository.findByExpiryDateBetweenAndAvailableQuantityGreaterThan(today, today.plusDays(7), 0);
        for (Batch b : expiring7) {
            if (!"EXPIRING_WITHIN_7_DAYS".equals(b.getStatus()) && !"EXPIRED".equals(b.getStatus())) {
                b.setStatus("EXPIRING_WITHIN_7_DAYS");
                batchRepository.save(b);
                notificationRepository.save(Notification.builder()
                        .type("EXPIRING_SOON")
                        .message("Batch " + b.getBatchNumber() + " expires in less than 7 days.")
                        .severity("WARNING")
                        .read(false)
                        .build());
            }
        }
    }

    
    @Scheduled(fixedRate = 300000) // Every 5 mins for testing
    @Transactional
    public void monitorLowStock() {
        log.info("Running scheduled Low Stock Monitoring Job");
        LocalDate today = LocalDate.now();
        
        // 1. Resolve any PENDING suggestions if stock is replenished
        List<ReorderSuggestion> pendingSuggestions = reorderSuggestionRepository.findByStatusOrderByCreatedAtDesc("PENDING");
        for (ReorderSuggestion req : pendingSuggestions) {
            int currentStock = batchRepository.sumAvailableQuantityByProductId(req.getProduct().getId(), today);
            if (currentStock > req.getProduct().getReorderLevel()) {
                req.setStatus("RESOLVED");
                reorderSuggestionRepository.save(req);
                notificationRepository.save(Notification.builder()
                        .type("STOCK_RESTOCKED")
                        .message("Product " + req.getProduct().getName() + " is back in stock. Current stock: " + currentStock)
                        .severity("INFO")
                        .read(false)
                        .build());
                List<Notification> notifs = notificationRepository.findAll();
                for(Notification n : notifs) {
                    if (n.getMessage().contains(req.getProduct().getName()) && n.getType().equals("LOW_STOCK")) {
                        notificationRepository.delete(n);
                    }
                }
            }
        }

        List<Product> activeProducts = productRepository.findByActiveTrue();
        for (Product product : activeProducts) {
            int currentStock = batchRepository.sumAvailableQuantityByProductId(product.getId(), today);
            
            if (currentStock <= product.getReorderLevel()) {
                // Check if a pending suggestion already exists to avoid spamming
                if (!reorderSuggestionRepository.existsByProductIdAndStatus(product.getId(), "PENDING")) {
                    ReorderSuggestion suggestion = ReorderSuggestion.builder()
                            .product(product)
                            .currentStock(currentStock)
                            .reorderLevel(product.getReorderLevel())
                            .suggestedQuantity(product.getReorderQuantity())
                            .status("PENDING")
                            .build();
                    reorderSuggestionRepository.save(suggestion);
                    notificationRepository.save(Notification.builder()
                            .type("LOW_STOCK")
                            .message("Product " + product.getName() + " has dropped below reorder level. Current stock: " + currentStock)
                            .severity("WARNING")
                            .read(false)
                            .build());
                }
            }
        }
    }

}
