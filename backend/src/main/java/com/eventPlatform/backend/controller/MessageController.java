package com.eventPlatform.backend.controller;

import com.eventPlatform.backend.entity.Messages;
import com.eventPlatform.backend.entity.User;
import com.eventPlatform.backend.service.BookingService;
import com.eventPlatform.backend.service.EventService;
import com.eventPlatform.backend.service.MessagesService;
import com.eventPlatform.backend.service.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/api/messages")
public class MessageController {

    private final EventService eventService;
    private final MessagesService messagesService;
    private final UserService userService;

    public MessageController(EventService eventService , MessagesService messagesService , UserService userService) {
        this.eventService = eventService;
        this.messagesService = messagesService;
        this.userService = userService;
    }

    @PostMapping
    public Messages createMessages(@RequestBody Messages messages) {
        messages.setStatus("UNREAD");
        return messagesService.saveMessages(messages);
    }

    @GetMapping("/sentMessages")
    public List<Messages> getSentMessages(Authentication authentication) {
        if(authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Not logged in");
        }
        Long userId = Long.parseLong(authentication.getName());
        return messagesService.getMessagesBySenderId(userId);
    }

    @GetMapping("/receivedMessages")
    public List<Messages> getReceivedMessages(Authentication authentication) {
        if(authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Not logged in");
        }
        Long userId = Long.parseLong(authentication.getName());
        return messagesService.getMessagesByRecipientId(userId);
    }

    @GetMapping("/getAllReadMessages")
    public List<Messages> getAllReadMessages(Authentication authentication) {
        if(authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Not logged in");
        }
        Long userId = Long.parseLong(authentication.getName());
        return messagesService.getMessagesByRecipientIdAndStatus(userId , "READ");
    }

    @DeleteMapping("/deleteMessage")
    public void deleteMessages(Authentication authentication, Messages message) {
        if(authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Not logged in");
        }
        Long messagesId = message.getId();
        messagesService.deleteMessage(messagesId);
    }

}
