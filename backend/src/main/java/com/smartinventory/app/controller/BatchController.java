package com.smartinventory.app.controller;

import com.smartinventory.app.dto.BatchDTO;
import com.smartinventory.app.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/batches")
@RequiredArgsConstructor
public class BatchController {

    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<List<BatchDTO>> getAllBatches() {
        return ResponseEntity.ok(inventoryService.getAllBatches());
    }
}
