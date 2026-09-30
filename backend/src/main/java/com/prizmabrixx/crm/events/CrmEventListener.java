package com.prizmabrixx.crm.events;

import com.prizmabrixx.crm.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class CrmEventListener {

    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    @EventListener
    public void handleCrmEvent(CrmEvent event) {
        log.info("Received internal CRM event for topic {}: {}", event.getTopic(), event.getAction());
        
        // Broadcast via WebSockets to the UI
        if (event.getTopic() != null && event.getPayload() != null) {
            messagingTemplate.convertAndSend(event.getTopic(), event.getPayload());
        }

        // Send Push Notification if message exists
        if (event.getMessage() != null && !event.getMessage().isEmpty()) {
            if (event.getTargetUserId() != null) {
                notificationService.notifyEmployee(event.getTargetUserId(), "Update: " + event.getAction(), event.getMessage());
            } else {
                notificationService.notifyAdmins("System Alert: " + event.getAction(), event.getMessage());
            }
        }
    }
}
