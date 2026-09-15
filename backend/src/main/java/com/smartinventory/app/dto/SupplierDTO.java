package com.smartinventory.app.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierDTO {
    private Long id;

    @NotBlank(message = "Supplier name is required")
    private String name;

    private String contactEmail;
    
    private String phone;
    
    private String address;

    private boolean active;
}
