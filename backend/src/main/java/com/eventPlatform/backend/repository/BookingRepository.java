package com.eventPlatform.backend.repository;

import com.eventPlatform.backend.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, Long> {
}