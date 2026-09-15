package com.smartinventory.app.messaging;

import com.smartinventory.app.entity.Notification;
import com.smartinventory.app.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationConsumer {

    private final NotificationRepository notificationRepository;

    @KafkaListener(topics = "inventory-notifications", groupId = "smart-inventory-group")
    public void consume(NotificationEvent event) {
        log.info("Consumed NotificationEvent from Kafka: {}", event);
        
        Notification notification = Notification.builder()
                .type(event.getType())
                .message(event.getMessage())
                .severity(event.getSeverity())
                .read(false)
                .build();
                
        notificationRepository.save(notification);
    }
}
