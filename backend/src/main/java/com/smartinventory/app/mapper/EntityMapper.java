package com.smartinventory.app.mapper;

import com.smartinventory.app.dto.CategoryDTO;
import com.smartinventory.app.dto.ProductDTO;
import com.smartinventory.app.dto.SupplierDTO;
import com.smartinventory.app.entity.Category;
import com.smartinventory.app.entity.Product;
import com.smartinventory.app.entity.Supplier;

public class EntityMapper {

    public static CategoryDTO toCategoryDTO(Category category) {
        if (category == null) return null;
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .build();
    }

    public static Category toCategory(CategoryDTO dto) {
        if (dto == null) return null;
        return Category.builder()
                .id(dto.getId())
                .name(dto.getName())
                .description(dto.getDescription())
                .build();
    }

    public static SupplierDTO toSupplierDTO(Supplier supplier) {
        if (supplier == null) return null;
        return SupplierDTO.builder()
                .id(supplier.getId())
                .name(supplier.getName())
                .contactEmail(supplier.getContactEmail())
                .phone(supplier.getPhone())
                .address(supplier.getAddress())
                .active(supplier.isActive())
                .build();
    }

    public static Supplier toSupplier(SupplierDTO dto) {
        if (dto == null) return null;
        return Supplier.builder()
                .id(dto.getId())
                .name(dto.getName())
                .contactEmail(dto.getContactEmail())
                .phone(dto.getPhone())
                .address(dto.getAddress())
                .active(dto.isActive() || dto.getId() == null) // Default true for new
                .build();
    }

    public static ProductDTO toProductDTO(Product product) {
        if (product == null) return null;
        return ProductDTO.builder()
                .id(product.getId())
                .sku(product.getSku())
                .name(product.getName())
                .description(product.getDescription())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .unit(product.getUnit())
                .sellingPrice(product.getSellingPrice())
                .costPrice(product.getCostPrice())
                .reorderLevel(product.getReorderLevel())
                .reorderQuantity(product.getReorderQuantity())
                .active(product.isActive())
                .build();
    }

    public static com.smartinventory.app.dto.BatchDTO toBatchDTO(com.smartinventory.app.entity.Batch batch) {
        if (batch == null) return null;
        return com.smartinventory.app.dto.BatchDTO.builder()
                .id(batch.getId())
                .batchNumber(batch.getBatchNumber())
                .productId(batch.getProduct().getId())
                .productName(batch.getProduct().getName())
                .supplierId(batch.getSupplier() != null ? batch.getSupplier().getId() : null)
                .supplierName(batch.getSupplier() != null ? batch.getSupplier().getName() : null)
                .manufacturingDate(batch.getManufacturingDate())
                .expiryDate(batch.getExpiryDate())
                .receivedQuantity(batch.getReceivedQuantity())
                .availableQuantity(batch.getAvailableQuantity())
                .unitCost(batch.getUnitCost())
                .status(batch.getStatus())
                .build();
    }

    public static com.smartinventory.app.dto.InventoryTransactionDTO toInventoryTransactionDTO(com.smartinventory.app.entity.InventoryTransaction tx) {
        if (tx == null) return null;
        return com.smartinventory.app.dto.InventoryTransactionDTO.builder()
                .id(tx.getId())
                .productId(tx.getProduct().getId())
                .productName(tx.getProduct().getName())
                .batchId(tx.getBatch().getId())
                .batchNumber(tx.getBatch().getBatchNumber())
                .type(tx.getType().name())
                .quantity(tx.getQuantity())
                .referenceId(tx.getReferenceId())
                .username(tx.getUser().getUsername())
                .notes(tx.getNotes())
                .timestamp(tx.getTimestamp())
                .build();
    }
}
