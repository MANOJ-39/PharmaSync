package com.smartinventory.app.controller;

import com.smartinventory.app.dto.BatchDTO;
import com.smartinventory.app.dto.InventoryTransactionDTO;
import com.smartinventory.app.dto.StockOutRequest;
import com.smartinventory.app.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping("/stock-in")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<BatchDTO> stockIn(@Valid @RequestBody BatchDTO request) {
        return new ResponseEntity<>(inventoryService.stockIn(request), HttpStatus.CREATED);
    }

    @PostMapping("/stock-out")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<InventoryTransactionDTO>> stockOut(@Valid @RequestBody StockOutRequest request) {
        return ResponseEntity.ok(inventoryService.stockOutFefo(request));
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<InventoryTransactionDTO>> getTransactions() {
        return ResponseEntity.ok(inventoryService.getRecentTransactions());
    }

    @PostMapping("/adjust")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<com.smartinventory.app.dto.InventoryAdjustmentDTO> adjustStock(@Valid @RequestBody com.smartinventory.app.dto.InventoryAdjustmentDTO request) {
        return ResponseEntity.ok(inventoryService.adjustStock(request));
    }

    @PostMapping("/dispose-expired/{batchId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Void> disposeExpiredStock(@PathVariable Long batchId, @RequestParam(required = false, defaultValue = "") String notes) {
        inventoryService.disposeExpiredStock(batchId, notes);
        return ResponseEntity.ok().build();
    }
}
