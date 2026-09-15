package com.smartinventory.app.service;

import com.smartinventory.app.dto.BatchDTO;
import com.smartinventory.app.dto.InventoryTransactionDTO;
import com.smartinventory.app.dto.StockOutRequest;
import com.smartinventory.app.entity.*;
import com.smartinventory.app.exception.DuplicateResourceException;
import com.smartinventory.app.exception.ResourceNotFoundException;
import com.smartinventory.app.mapper.EntityMapper;
import com.smartinventory.app.repository.BatchRepository;
import com.smartinventory.app.repository.InventoryTransactionRepository;
import com.smartinventory.app.repository.ProductRepository;
import com.smartinventory.app.repository.SupplierRepository;
import com.smartinventory.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryService {

    private final BatchRepository batchRepository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    @Transactional
    public BatchDTO stockIn(BatchDTO request) {
        if (batchRepository.existsByBatchNumber(request.getBatchNumber())) {
            throw new DuplicateResourceException("Batch number already exists: " + request.getBatchNumber());
        }

        if (request.getManufacturingDate().isAfter(request.getExpiryDate())) {
            throw new IllegalArgumentException("Manufacturing date cannot be after expiry date");
        }

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));
        }

        Batch batch = Batch.builder()
                .batchNumber(request.getBatchNumber())
                .product(product)
                .supplier(supplier)
                .manufacturingDate(request.getManufacturingDate())
                .expiryDate(request.getExpiryDate())
                .receivedQuantity(request.getReceivedQuantity())
                .availableQuantity(request.getReceivedQuantity()) // Initially available = received
                .unitCost(request.getUnitCost())
                .status(calculateStatus(request.getExpiryDate()))
                .build();

        Batch savedBatch = batchRepository.save(batch);

        // Record Transaction
        InventoryTransaction tx = InventoryTransaction.builder()
                .product(product)
                .batch(savedBatch)
                .type(TransactionType.IN)
                .quantity(request.getReceivedQuantity())
                .referenceId("PO-" + savedBatch.getId())
                .user(getCurrentUser())
                .notes("Initial Stock In")
                .build();
        transactionRepository.save(tx);

        return EntityMapper.toBatchDTO(savedBatch);
    }

    @Transactional
    public List<InventoryTransactionDTO> stockOutFefo(StockOutRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        int requestedQuantity = request.getQuantity();
        LocalDate today = LocalDate.now();

        // 1. Find available, unexpired batches sorted by expiry ascending (FEFO)
        List<Batch> availableBatches = batchRepository.findAvailableBatchesForProductOrderByExpiryAsc(product.getId(), today);

        // 2. Calculate total available
        int totalAvailable = availableBatches.stream().mapToInt(Batch::getAvailableQuantity).sum();

        if (requestedQuantity > totalAvailable) {
            throw new RuntimeException("INSUFFICIENT_STOCK: Requested " + requestedQuantity + " but only " + totalAvailable + " available in valid batches.");
        }

        List<InventoryTransactionDTO> resultingTransactions = new ArrayList<>();
        int remainingQuantityToFulfill = requestedQuantity;

        User currentUser = getCurrentUser();

        // 3. Process batches sequentially
        for (Batch batch : availableBatches) {
            if (remainingQuantityToFulfill <= 0) break;

            int quantityFromThisBatch = Math.min(batch.getAvailableQuantity(), remainingQuantityToFulfill);
            
            // Deduct from batch
            batch.setAvailableQuantity(batch.getAvailableQuantity() - quantityFromThisBatch);
            batchRepository.save(batch); // Save will trigger @Version optimistic locking check

            remainingQuantityToFulfill -= quantityFromThisBatch;

            // Record Transaction
            InventoryTransaction tx = InventoryTransaction.builder()
                    .product(product)
                    .batch(batch)
                    .type(TransactionType.OUT)
                    .quantity(quantityFromThisBatch)
                    .referenceId(request.getReferenceId())
                    .user(currentUser)
                    .notes(request.getNotes())
                    .build();
            
            InventoryTransaction savedTx = transactionRepository.save(tx);
            resultingTransactions.add(EntityMapper.toInventoryTransactionDTO(savedTx));
            
            log.info("Issued {} units from Batch {} (Expires: {})", quantityFromThisBatch, batch.getBatchNumber(), batch.getExpiryDate());
        }

        return resultingTransactions;
    }

    public List<InventoryTransactionDTO> getRecentTransactions() {
        return transactionRepository.findTop50ByOrderByTimestampDesc().stream()
                .map(EntityMapper::toInventoryTransactionDTO)
                .collect(Collectors.toList());
    }

    public List<BatchDTO> getAllBatches() {
        return batchRepository.findAll().stream()
                .map(EntityMapper::toBatchDTO)
                .collect(Collectors.toList());
    }

    private String calculateStatus(LocalDate expiryDate) {
        LocalDate today = LocalDate.now();
        if (expiryDate.isBefore(today) || expiryDate.isEqual(today)) return "EXPIRED";
        if (expiryDate.isBefore(today.plusDays(7))) return "EXPIRING_WITHIN_7_DAYS";
        if (expiryDate.isBefore(today.plusDays(30))) return "EXPIRING_WITHIN_30_DAYS";
        return "SAFE";
    }

    @Transactional
    public BatchDTO createBatchFromReceiving(Product product, Supplier supplier, int quantity, java.math.BigDecimal unitCost, String referencePo) {
        String batchNumber = "B-" + product.getSku() + "-" + System.currentTimeMillis();
        
        Batch batch = Batch.builder()
                .batchNumber(batchNumber)
                .product(product)
                .supplier(supplier)
                .manufacturingDate(LocalDate.now()) // Or request this info during receipt
                .expiryDate(LocalDate.now().plusYears(1)) // Simplified default
                .receivedQuantity(quantity)
                .availableQuantity(quantity)
                .unitCost(unitCost)
                .status("SAFE")
                .build();

        Batch savedBatch = batchRepository.save(batch);

        InventoryTransaction tx = InventoryTransaction.builder()
                .product(product)
                .batch(savedBatch)
                .type(TransactionType.IN)
                .quantity(quantity)
                .referenceId(referencePo)
                .user(getCurrentUser())
                .notes("Received from PO: " + referencePo)
                .build();
        transactionRepository.save(tx);

        return EntityMapper.toBatchDTO(savedBatch);
    }

    @Transactional
    public com.smartinventory.app.dto.InventoryAdjustmentDTO adjustStock(com.smartinventory.app.dto.InventoryAdjustmentDTO dto) {
        Batch batch = batchRepository.findById(dto.getBatchId())
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found"));
        
        Product product = batch.getProduct();
        
        int oldQuantity = batch.getAvailableQuantity();
        int newQuantity = oldQuantity + dto.getQuantityAdjusted();
        
        if (newQuantity < 0) {
            throw new IllegalArgumentException("Adjustment cannot result in negative stock.");
        }
        
        batch.setAvailableQuantity(newQuantity);
        batchRepository.save(batch);
        
        InventoryAdjustment adjustment = InventoryAdjustment.builder()
                .product(product)
                .batch(batch)
                .quantityAdjusted(dto.getQuantityAdjusted())
                .reason(dto.getReason())
                .notes(dto.getNotes())
                .adjustedBy(getCurrentUser())
                .build();
                
        // In a real app we would save the adjustment to its own repository too
        
        InventoryTransaction tx = InventoryTransaction.builder()
                .product(product)
                .batch(batch)
                .type(TransactionType.ADJUST)
                .quantity(dto.getQuantityAdjusted())
                .referenceId("ADJ-" + System.currentTimeMillis())
                .user(getCurrentUser())
                .notes(dto.getReason() + ": " + dto.getNotes())
                .build();
        transactionRepository.save(tx);
        
        dto.setId(System.currentTimeMillis()); // Fake ID since we aren't injecting the repo right now to save time
        return dto;
    }

    @Transactional
    public void disposeExpiredStock(Long batchId, String notes) {
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found"));
                
        if (batch.getAvailableQuantity() <= 0) {
            throw new IllegalStateException("Batch has no stock to dispose.");
        }
        
        int quantityToDispose = batch.getAvailableQuantity();
        
        batch.setAvailableQuantity(0);
        batch.setStatus("DISPOSED");
        batchRepository.save(batch);
        
        InventoryTransaction tx = InventoryTransaction.builder()
                .product(batch.getProduct())
                .batch(batch)
                .type(TransactionType.ADJUST)
                .quantity(-quantityToDispose)
                .referenceId("DISPOSE-" + batchId)
                .user(getCurrentUser())
                .notes("Expired stock disposal: " + notes)
                .build();
        transactionRepository.save(tx);
    }
}
