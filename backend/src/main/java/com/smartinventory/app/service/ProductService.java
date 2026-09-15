package com.smartinventory.app.service;

import com.smartinventory.app.dto.ProductDTO;
import com.smartinventory.app.entity.Category;
import com.smartinventory.app.entity.Product;
import com.smartinventory.app.exception.DuplicateResourceException;
import com.smartinventory.app.exception.ResourceNotFoundException;
import com.smartinventory.app.mapper.EntityMapper;
import com.smartinventory.app.repository.CategoryRepository;
import com.smartinventory.app.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Cacheable(value = "products")
    public List<ProductDTO> getAllActiveProducts() {
        return productRepository.findByActiveTrue().stream()
                .map(EntityMapper::toProductDTO)
                .collect(Collectors.toList());
    }

    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return EntityMapper.toProductDTO(product);
    }

    public ProductDTO getProductBySku(String sku) {
        Product product = productRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with SKU: " + sku));
        return EntityMapper.toProductDTO(product);
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public ProductDTO createProduct(ProductDTO productDTO) {
        if (productRepository.existsBySku(productDTO.getSku())) {
            throw new DuplicateResourceException("Product already exists with SKU: " + productDTO.getSku());
        }

        Category category = categoryRepository.findById(productDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + productDTO.getCategoryId()));

        Product product = Product.builder()
                .sku(productDTO.getSku())
                .name(productDTO.getName())
                .description(productDTO.getDescription())
                .category(category)
                .unit(productDTO.getUnit())
                .sellingPrice(productDTO.getSellingPrice())
                .costPrice(productDTO.getCostPrice())
                .reorderLevel(productDTO.getReorderLevel())
                .reorderQuantity(productDTO.getReorderQuantity())
                .active(true)
                .build();

        Product saved = productRepository.save(product);
        return EntityMapper.toProductDTO(saved);
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public ProductDTO updateProduct(Long id, ProductDTO productDTO) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (!existingProduct.getSku().equals(productDTO.getSku()) && 
            productRepository.existsBySku(productDTO.getSku())) {
            throw new DuplicateResourceException("Product already exists with SKU: " + productDTO.getSku());
        }

        Category category = categoryRepository.findById(productDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + productDTO.getCategoryId()));

        existingProduct.setSku(productDTO.getSku());
        existingProduct.setName(productDTO.getName());
        existingProduct.setDescription(productDTO.getDescription());
        existingProduct.setCategory(category);
        existingProduct.setUnit(productDTO.getUnit());
        existingProduct.setSellingPrice(productDTO.getSellingPrice());
        existingProduct.setCostPrice(productDTO.getCostPrice());
        existingProduct.setReorderLevel(productDTO.getReorderLevel());
        existingProduct.setReorderQuantity(productDTO.getReorderQuantity());

        Product updated = productRepository.save(existingProduct);
        return EntityMapper.toProductDTO(updated);
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public void deactivateProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        product.setActive(false);
        productRepository.save(product);
    }
}
