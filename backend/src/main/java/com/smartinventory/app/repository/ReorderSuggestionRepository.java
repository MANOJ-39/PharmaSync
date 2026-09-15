package com.smartinventory.app.repository;

import com.smartinventory.app.entity.ReorderSuggestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReorderSuggestionRepository extends JpaRepository<ReorderSuggestion, Long> {
    List<ReorderSuggestion> findByStatusOrderByCreatedAtDesc(String status);
    boolean existsByProductIdAndStatus(Long productId, String status);
}
