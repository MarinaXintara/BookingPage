package com.eventPlatform.backend.repository;

import com.eventPlatform.backend.entity.TicketType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketTypeRepository extends JpaRepository<TicketType, Long> {
}