package com.smartinventory.app.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationProducer {

    private final KafkaTemplate<String, NotificationEvent> kafkaTemplate;
    private static final String TOPIC = "inventory-notifications";

    public void sendNotificationEvent(String type, String message, String severity) {
        NotificationEvent event = NotificationEvent.builder()
                .type(type)
                .message(message)
                .severity(severity)
                .build();
        
        log.info("Publishing NotificationEvent to Kafka: {}", event);
        kafkaTemplate.send(TOPIC, event);
    }
}
