package com.eventPlatform.backend.controller;

import com.eventPlatform.backend.entity.Event;
import com.eventPlatform.backend.entity.Media;
import com.eventPlatform.backend.service.EventService;
import com.eventPlatform.backend.service.FileStorageService;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;
    private final FileStorageService fileStorageService;

    public EventController(
            EventService eventService,
            FileStorageService fileStorageService) {

        this.eventService = eventService;
        this.fileStorageService = fileStorageService;
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


    // =========================
    // CREATE EVENT
    // =========================

    @PostMapping(
            value = "/createEvent",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public Event createEvent(
            @RequestPart("event") Event event,
            @RequestPart(value = "files", required = false)   //add multiple files
            List<MultipartFile> files
    ) throws IOException {

        if (files != null) {

            for (MultipartFile file : files) {

                if (!file.isEmpty()) {

                    String imageUrl =
                            fileStorageService.store(file);

                    Media media = new Media();

                    media.setImageUrl(imageUrl);
                    media.setEvent(event);

                    event.getMedia().add(media);
                }
            }
        }

        return eventService.saveEvent(event);
    }


    // =========================
    // EDIT EVENT
    // =========================

    @PatchMapping(
            value = "/editEvent",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public Event editEvent(
            @RequestPart("event") Event event,
            @RequestPart(value = "files", required = false)
            List<MultipartFile> files
    ) throws IOException {

        Event temp = eventService.findById(event.getId());

        if (temp == null) {
            throw new RuntimeException("Event not found");
        }


        // -------------------------
        // Existing edit logic
        // -------------------------

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

        if (event.getTicketTypes() != null &&
                !event.getTicketTypes().isEmpty()) {

            temp.setTicketTypes(event.getTicketTypes());
        }

        if (event.getBookings() != null &&
                !event.getBookings().isEmpty()) {

            temp.setBookings(event.getBookings());
        }


        // -------------------------
        // New images
        // -------------------------

        if (files != null && !files.isEmpty()) {

            for (MultipartFile file : files) {

                if (!file.isEmpty()) {

                    String imageUrl =
                            fileStorageService.store(file);

                    Media media = new Media();

                    media.setImageUrl(imageUrl);
                    media.setEvent(temp);

                    temp.getMedia().add(media);
                }
            }
        }

        return eventService.saveEvent(temp);
    }


    // =========================
    // DELETE EVENT
    // =========================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {

        eventService.deleteEvent(id);

        return ResponseEntity.noContent().build();
    }
}
   

    