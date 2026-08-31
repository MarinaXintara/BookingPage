package com.eventPlatform.backend.controller;

import com.eventPlatform.backend.entity.Messages;
import com.eventPlatform.backend.entity.User;
import com.eventPlatform.backend.service.BookingService;
import com.eventPlatform.backend.service.EventService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@RequestMapping("/api/messages")
public class MessageController {

    private final EventService eventService;

    public MessageController(EventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping
    public Messages createMessages(@RequestBody Messages messages) {
        return messagesService.saveMessages(messages);
    }
}
