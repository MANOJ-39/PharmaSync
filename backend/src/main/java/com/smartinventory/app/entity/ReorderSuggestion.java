package com.smartinventory.app.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reorder_suggestions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReorderSuggestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer currentStock;

    @Column(nullable = false)
    private Integer reorderLevel;

    @Column(nullable = false)
    private Integer suggestedQuantity;

    @Column(nullable = false)
    private String status; // PENDING, ORDERED, COMPLETED, DISMISSED

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
