package com.eventPlatform.backend.service;

import com.eventPlatform.backend.entity.Messages;
import com.eventPlatform.backend.repository.MessagesRepository;
import org.springframework.stereotype.Service;

import java.util.List;

public class MessagesService {

    private MessagesRepository messagesRepository;

    public MessagesService(MessagesRepository messagesRepository) {
        this.messagesRepository = messagesRepository;
    }

    public List<Messages> getMessagesBySenderId(Long userId) {
        return messagesRepository.findBySenderId(userId);
    }
    public List<Messages> getMessagesByRecipientId(Long userId) {
        return messagesRepository.findByRecipientId(userId);
    }

    public Messages saveMessages(Messages messages) {
        return messagesRepository.save(messages);
    }
    public List<Messages> getMessagesByRecipientIdAndStatus(Long userId,boolean status) {return messagesRepository.findByRecipientIdAndStatus(userId,status);}

    public void deleteMessage(Long id) {
        messagesRepository.deleteById(id);
    }
}
