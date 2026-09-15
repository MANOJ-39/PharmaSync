package com.smartinventory.app.repository;

import com.smartinventory.app.entity.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BatchRepository extends JpaRepository<Batch, Long> {
    Optional<Batch> findByBatchNumber(String batchNumber);
    boolean existsByBatchNumber(String batchNumber);
    
    // Find batches with available stock for FEFO, ordered by expiry ascending
    @Query("SELECT b FROM Batch b WHERE b.product.id = :productId AND b.availableQuantity > 0 AND b.expiryDate > :today ORDER BY b.expiryDate ASC")
    List<Batch> findAvailableBatchesForProductOrderByExpiryAsc(@Param("productId") Long productId, @Param("today") LocalDate today);

    // Sum total available quantity for a product (not expired)
    @Query("SELECT COALESCE(SUM(b.availableQuantity), 0) FROM Batch b WHERE b.product.id = :productId AND b.expiryDate > :today")
    Integer sumAvailableQuantityByProductId(@Param("productId") Long productId, @Param("today") LocalDate today);

    // Find batches expiring between two dates
    List<Batch> findByExpiryDateBetweenAndAvailableQuantityGreaterThan(LocalDate startDate, LocalDate endDate, Integer minQuantity);
    
    // Find expired batches with stock
    List<Batch> findByExpiryDateBeforeAndAvailableQuantityGreaterThan(LocalDate date, Integer minQuantity);
}
