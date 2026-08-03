package com.eventPlatform.backend.controller;

import com.eventPlatform.backend.DTO.BookingRequest;
import com.eventPlatform.backend.entity.Booking;
import com.eventPlatform.backend.jwt.JwtService;
import com.eventPlatform.backend.service.BookingService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/Booking")
public class BookingController {
    private final BookingService bookingService;
    private final JwtService jwtService;

    public BookingController(BookingService bookingService ,  JwtService jwtService) {
        this.bookingService = bookingService;
        this.jwtService = jwtService;
    }

    @GetMapping
    public List<Booking> getAllEvents() {
        return bookingService.getAllBookings();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id) {
        return bookingService.getBookingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/myBookings")
    public List<Booking> getMyBookings(Authentication authentication) {
        if(authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Not logged in");
        }
        Long userId = Long.parseLong(authentication.getName());

        return bookingService.getBookingsByUser(userId);
    }

    @PostMapping("/createBooking")
    public Booking createBooking(@RequestBody BookingRequest request,Authentication authentication) {
        if(authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Not logged in");
        }
        Long userId = Long.parseLong(authentication.getName());

        return bookingService.createBooking(request, userId);
    }

//    @PatchMapping("/editBooking")
//    public Booking editEvent(@RequestBody Booking booking) {
//    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }

}
