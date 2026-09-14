package com.smartinventory.app.service;

import com.smartinventory.app.dto.PurchaseOrderDTO;
import com.smartinventory.app.dto.PurchaseOrderItemDTO;
import com.smartinventory.app.entity.*;
import com.smartinventory.app.exception.ResourceNotFoundException;
import com.smartinventory.app.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<PurchaseOrderDTO> getAllPurchaseOrders() {
        return purchaseOrderRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PurchaseOrderDTO getPurchaseOrderById(Long id) {
        return purchaseOrderRepository.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order not found"));
    }

    @Transactional
    public PurchaseOrderDTO createDraftOrder(PurchaseOrderDTO dto) {
        Supplier supplier = supplierRepository.findById(dto.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));

        PurchaseOrder po = PurchaseOrder.builder()
                .poNumber("PO-" + System.currentTimeMillis())
                .supplier(supplier)
                .status(PurchaseOrderStatus.DRAFT)
                .notes(dto.getNotes())
                // .createdBy(currentUser) -> in a real app, inject user from SecurityContext
                .build();

        if (dto.getItems() != null) {
            for (PurchaseOrderItemDTO itemDTO : dto.getItems()) {
                Product product = productRepository.findById(itemDTO.getProductId())
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

                PurchaseOrderItem item = PurchaseOrderItem.builder()
                        .product(product)
                        .quantity(itemDTO.getQuantity())
                        .unitPrice(itemDTO.getUnitPrice())
                        .build();

                po.addItem(item);
            }
        }

        PurchaseOrder savedPo = purchaseOrderRepository.save(po);
        return mapToDTO(savedPo);
    }

    @Transactional
    public PurchaseOrderDTO approveOrder(Long id) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order not found"));

        if (po.getStatus() != PurchaseOrderStatus.DRAFT && po.getStatus() != PurchaseOrderStatus.PENDING_APPROVAL) {
            throw new IllegalStateException("Only DRAFT or PENDING_APPROVAL orders can be approved");
        }

        po.setStatus(PurchaseOrderStatus.APPROVED);
        // po.setApprovedBy(currentUser);

        PurchaseOrder updatedPo = purchaseOrderRepository.save(po);
        return mapToDTO(updatedPo);
    }

    @Transactional
    public PurchaseOrderDTO receiveOrder(Long id) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order not found"));

        if (po.getStatus() != PurchaseOrderStatus.APPROVED) {
            throw new IllegalStateException("Only APPROVED orders can be received");
        }

        // For each item, automatically create a batch via InventoryService
        for (PurchaseOrderItem item : po.getItems()) {
            inventoryService.createBatchFromReceiving(
                    item.getProduct(), 
                    po.getSupplier(), 
                    item.getQuantity(), 
                    item.getUnitPrice(), 
                    po.getPoNumber()
            );
        }

        po.setStatus(PurchaseOrderStatus.RECEIVED);
        PurchaseOrder updatedPo = purchaseOrderRepository.save(po);
        return mapToDTO(updatedPo);
    }

    private PurchaseOrderDTO mapToDTO(PurchaseOrder po) {
        return PurchaseOrderDTO.builder()
                .id(po.getId())
                .poNumber(po.getPoNumber())
                .supplierId(po.getSupplier().getId())
                .supplierName(po.getSupplier().getName())
                .status(po.getStatus())
                .totalAmount(po.getTotalAmount())
                .notes(po.getNotes())
                .items(po.getItems().stream().map(this::mapItemToDTO).collect(Collectors.toList()))
                .createdAt(po.getCreatedAt())
                .build();
    }

    private PurchaseOrderItemDTO mapItemToDTO(PurchaseOrderItem item) {
        return PurchaseOrderItemDTO.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .productSku(item.getProduct().getSku())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .subtotal(item.getSubtotal())
                .build();
    }
}
