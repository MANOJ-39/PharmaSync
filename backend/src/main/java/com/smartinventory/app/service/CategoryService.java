package com.smartinventory.app.service;

import com.smartinventory.app.dto.CategoryDTO;
import com.smartinventory.app.entity.Category;
import com.smartinventory.app.exception.DuplicateResourceException;
import com.smartinventory.app.exception.ResourceNotFoundException;
import com.smartinventory.app.mapper.EntityMapper;
import com.smartinventory.app.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(EntityMapper::toCategoryDTO)
                .collect(Collectors.toList());
    }

    public CategoryDTO getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return EntityMapper.toCategoryDTO(category);
    }

    @Transactional
    public CategoryDTO createCategory(CategoryDTO categoryDTO) {
        if (categoryRepository.existsByName(categoryDTO.getName())) {
            throw new DuplicateResourceException("Category already exists with name: " + categoryDTO.getName());
        }
        Category category = EntityMapper.toCategory(categoryDTO);
        Category saved = categoryRepository.save(category);
        return EntityMapper.toCategoryDTO(saved);
    }

    @Transactional
    public CategoryDTO updateCategory(Long id, CategoryDTO categoryDTO) {
        Category existingCategory = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        if (!existingCategory.getName().equals(categoryDTO.getName()) && 
            categoryRepository.existsByName(categoryDTO.getName())) {
            throw new DuplicateResourceException("Category already exists with name: " + categoryDTO.getName());
        }

        existingCategory.setName(categoryDTO.getName());
        existingCategory.setDescription(categoryDTO.getDescription());

        Category updated = categoryRepository.save(existingCategory);
        return EntityMapper.toCategoryDTO(updated);
    }
}
