package com.smartinventory.app.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "batches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Batch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String batchNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @Column(nullable = false)
    private LocalDate manufacturingDate;

    @Column(nullable = false)
    private LocalDate expiryDate;

    @Column(nullable = false)
    private Integer receivedQuantity;

    @Column(nullable = false)
    private Integer availableQuantity;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal unitCost;

    @Column(nullable = false)
    private String status; // e.g., SAFE, EXPIRING_SOON, EXPIRED

    @Version
    private Integer version; // For Optimistic Locking

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
