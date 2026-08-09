package com.eventPlatform.backend.repository;

import com.eventPlatform.backend.entity.EventVisit;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventVisitRepository extends JpaRepository<EventVisit, Long> {
}
