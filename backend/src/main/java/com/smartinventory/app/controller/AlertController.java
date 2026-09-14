package com.smartinventory.app.controller;

import com.smartinventory.app.entity.Notification;
import com.smartinventory.app.entity.ReorderSuggestion;
import com.smartinventory.app.repository.NotificationRepository;
import com.smartinventory.app.repository.ReorderSuggestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final NotificationRepository notificationRepository;
    private final ReorderSuggestionRepository reorderSuggestionRepository;

    @GetMapping("/notifications")
    public ResponseEntity<List<Notification>> getNotifications() {
        return ResponseEntity.ok(notificationRepository.findTop20ByOrderByCreatedAtDesc());
    }

    @GetMapping("/reorders")
    public ResponseEntity<List<ReorderSuggestion>> getPendingReorders() {
        return ResponseEntity.ok(reorderSuggestionRepository.findByStatusOrderByCreatedAtDesc("PENDING"));
    }
}
