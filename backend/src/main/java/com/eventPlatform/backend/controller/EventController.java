package com.eventPlatform.backend.controller;

import com.eventPlatform.backend.entity.Event;
import com.eventPlatform.backend.entity.User;
import com.eventPlatform.backend.service.EventService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public List<Event> getAllEvents() {
        return eventService.getAllEvents();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        return eventService.getEventById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/createEvent")
    public Event createEvent(@RequestBody Event event) {
        return eventService.saveEvent(event);
    }

    @PatchMapping("/editEvent")
    public Event editEvent(@RequestBody Event event) {
        Event temp = eventService.findById(event.getId());
        if (temp == null) {
            throw new RuntimeException("Event not found");
        }

        if (event.getTitle() != null) {
            temp.setTitle(event.getTitle());
        }

        if (event.getCategory() != null) {
            temp.setCategory(event.getCategory());
        }

        if (event.getEventType() != null) {
            temp.setEventType(event.getEventType());
        }

        if (event.getVenue() != null) {
            temp.setVenue(event.getVenue());
        }

        if (event.getAddress() != null) {
            temp.setAddress(event.getAddress());
        }

        if (event.getCity() != null) {
            temp.setCity(event.getCity());
        }

        if (event.getCountry() != null) {
            temp.setCountry(event.getCountry());
        }

        if (event.getLatitude() != null) {
            temp.setLatitude(event.getLatitude());
        }

        if (event.getLongitude() != null) {
            temp.setLongitude(event.getLongitude());
        }

        if (event.getStartDateTime() != null) {
            temp.setStartDateTime(event.getStartDateTime());
        }

        if (event.getEndDateTime() != null) {
            temp.setEndDateTime(event.getEndDateTime());
        }

        if (event.getCapacity() != null) {
            temp.setCapacity(event.getCapacity());
        }

        if (event.getStatus() != null) {
            temp.setStatus(event.getStatus());
        }

        if (event.getDescription() != null) {
            temp.setDescription(event.getDescription());
        }

        if (event.getOrganizer() != null) {
            temp.setOrganizer(event.getOrganizer());
        }

        if (event.getTicketTypes() != null && !event.getTicketTypes().isEmpty()) {
            temp.setTicketTypes(event.getTicketTypes());
        }

        if (event.getBookings() != null && !event.getBookings().isEmpty()) {
            temp.setBookings(event.getBookings());
        }

        return eventService.saveEvent(temp);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }


}