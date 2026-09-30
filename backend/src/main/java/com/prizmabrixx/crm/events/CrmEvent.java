package com.prizmabrixx.crm.events;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class CrmEvent extends ApplicationEvent {
    private final String topic;
    private final String action;
    private final String message;
    private final Object payload;
    private final Long targetUserId;

    public CrmEvent(Object source, String topic, String action, String message, Object payload, Long targetUserId) {
        super(source);
        this.topic = topic;
        this.action = action;
        this.message = message;
        this.payload = payload;
        this.targetUserId = targetUserId;
    }
}
