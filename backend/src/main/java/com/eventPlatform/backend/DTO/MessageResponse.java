package com.eventPlatform.backend.DTO;

public class MessageResponse {
    private Long id;
    private Long senderId;
    private String senderName;
    private Long receiverId;
    private String receiverName;
    private Long eventId;
    private String eventName;
    private String subject;
    private String message;
    private boolean isRead;
    private String createdAt;

    public MessageResponse(
            Long id,
            Long senderId,
            String senderName,
            Long receiverId,
            String receiverName,
            Long eventId,
            String eventName,
            String subject,
            String message,
            boolean isRead,
            String createdAt
    ) {
        this.id = id;
        this.senderId = senderId;
        this.senderName = senderName;
        this.receiverId = receiverId;
        this.receiverName = receiverName;
        this.eventId = eventId;
        this.eventName = eventName;
        this.subject = subject;
        this.message = message;
        this.isRead = isRead;
        this.createdAt = createdAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public void setReceiverId(Long receiverId) {
        this.receiverId = receiverId;
    }

    public void setReceiverName(String receiverName) {
        this.receiverName = receiverName;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public void setEventName(String eventName) {
        this.eventName = eventName;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setRead(boolean read) {
        isRead = read;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
