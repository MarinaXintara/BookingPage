package com.eventPlatform.backend.repository;

import com.eventPlatform.backend.entity.EventVisit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EventVisitRepository extends JpaRepository<EventVisit, Long> {
    Optional<EventVisit> findByAttendeeIdAndEventId(Long attendeeId, Long eventId);
    Optional<EventVisit> findByEventId(Long eventId);
    void deleteByEventId(Long eventId);
}
