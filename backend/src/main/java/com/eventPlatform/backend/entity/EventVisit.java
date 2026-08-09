package com.eventPlatform.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDateTime;

/** Records that an authenticated attendee viewed an event. */
@Entity
@Table(name = "event_visits", uniqueConstraints = @UniqueConstraint(columnNames = {"attendee_id", "event_id"}))
public class EventVisit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime visitedAt;

    @ManyToOne
    @JoinColumn(name = "attendee_id", nullable = false)
    private User attendee;

    @ManyToOne
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    public Long getId() { return id; }
    public LocalDateTime getVisitedAt() { return visitedAt; }
    public void setVisitedAt(LocalDateTime visitedAt) { this.visitedAt = visitedAt; }
    public User getAttendee() { return attendee; }
    public void setAttendee(User attendee) { this.attendee = attendee; }
    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }
}
