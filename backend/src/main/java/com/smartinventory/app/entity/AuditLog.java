package com.smartinventory.app.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String action; // e.g., "UPDATE_STOCK", "CREATE_PRODUCT"

    @Column(nullable = false)
    private String entity; // e.g., "Product", "Batch"

    @Column(nullable = false)
    private Long entityId;

    @Column(length = 1000)
    private String oldValue;

    @Column(length = 1000)
    private String newValue;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime timestamp;
}
