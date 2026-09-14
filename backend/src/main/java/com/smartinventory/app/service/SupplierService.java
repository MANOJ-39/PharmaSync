package com.smartinventory.app.service;

import com.smartinventory.app.dto.SupplierDTO;
import com.smartinventory.app.entity.Supplier;
import com.smartinventory.app.exception.ResourceNotFoundException;
import com.smartinventory.app.mapper.EntityMapper;
import com.smartinventory.app.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public List<SupplierDTO> getAllActiveSuppliers() {
        return supplierRepository.findByActiveTrue().stream()
                .map(EntityMapper::toSupplierDTO)
                .collect(Collectors.toList());
    }

    public SupplierDTO getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        return EntityMapper.toSupplierDTO(supplier);
    }

    @Transactional
    public SupplierDTO createSupplier(SupplierDTO supplierDTO) {
        Supplier supplier = EntityMapper.toSupplier(supplierDTO);
        supplier.setActive(true); // Always active on creation
        Supplier saved = supplierRepository.save(supplier);
        return EntityMapper.toSupplierDTO(saved);
    }

    @Transactional
    public SupplierDTO updateSupplier(Long id, SupplierDTO supplierDTO) {
        Supplier existingSupplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));

        existingSupplier.setName(supplierDTO.getName());
        existingSupplier.setContactEmail(supplierDTO.getContactEmail());
        existingSupplier.setPhone(supplierDTO.getPhone());
        existingSupplier.setAddress(supplierDTO.getAddress());

        Supplier updated = supplierRepository.save(existingSupplier);
        return EntityMapper.toSupplierDTO(updated);
    }

    @Transactional
    public void deactivateSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        supplier.setActive(false);
        supplierRepository.save(supplier);
    }
}
