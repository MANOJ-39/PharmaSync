package com.smartinventory.app.repository;

import com.smartinventory.app.entity.InventoryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {
    List<InventoryTransaction> findByProductIdOrderByTimestampDesc(Long productId);
    List<InventoryTransaction> findTop50ByOrderByTimestampDesc();
}
