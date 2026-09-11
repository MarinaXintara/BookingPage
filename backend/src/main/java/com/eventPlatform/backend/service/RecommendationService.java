package com.eventPlatform.backend.service;

import com.eventPlatform.backend.DTO.RecommendationResponse;
import com.eventPlatform.backend.entity.Booking;
import com.eventPlatform.backend.entity.Event;
import com.eventPlatform.backend.repository.BookingRepository;
import com.eventPlatform.backend.repository.EventRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RecommendationService {
    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final MatrixFactorizationService matrixFactorizationService;

    public RecommendationService(BookingRepository bookingRepository,
                                 EventRepository eventRepository,
                                 MatrixFactorizationService matrixFactorizationService) {
        this.bookingRepository = bookingRepository;
        this.eventRepository = eventRepository;
        this.matrixFactorizationService = matrixFactorizationService;
    }

    public List<RecommendationResponse> getRecommendations(Long userId) {
        List<Event> visitedEvents = getUserHistory(userId);

        return null;
    }

    public List<Event> getUserHistory(Long userId){
        List<Booking> userBookings = bookingRepository.findByAttendeeId(userId);
        List<Event> visitedEvents = new ArrayList<>();

        for (Booking booking : userBookings) {
            visitedEvents.add(booking.getEvent());
        }

        return visitedEvents;
    }

    public List<Event> getCandidateEvents(Long userId) {
        List<Event> allEvents = eventRepository.findAll();
        List<Event> visitedEvents = getUserHistory(userId);
        List<Event> candidateEvents = new ArrayList<>();

        for (Event event : allEvents) {
            boolean visited = false;

            for (Event visitedEvent : visitedEvents) {
                if (event.getId().equals(visitedEvent.getId())) {
                    visited = true;
                    break;
                }
            }
            if (!visited) {
                candidateEvents.add(event);
            }
        }
        return candidateEvents;
    }

    public List<Double> calculateScores(Long userId,List<Event>candidateEvents){
        return null;
    }

//    public createRecommendations(List<Double >scoredEvents){
//        return null;
//    }
}
