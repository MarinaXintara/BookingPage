package com.eventPlatform.backend.service;

import com.eventPlatform.backend.DTO.RecommendedEventResponse;
import com.eventPlatform.backend.entity.Booking;
import com.eventPlatform.backend.entity.Event;
import com.eventPlatform.backend.entity.EventVisit;
import com.eventPlatform.backend.enums.BookingStatus;
import com.eventPlatform.backend.enums.EventStatus;
import com.eventPlatform.backend.repository.BookingRepository;
import com.eventPlatform.backend.repository.EventRepository;
import com.eventPlatform.backend.repository.EventVisitRepository;
import com.eventPlatform.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;

@Service
public class RecommendationService {
    private static final int LATENT_FACTORS = 12;
    private static final int EPOCHS = 80;
    private static final int MAX_RECOMMENDATIONS = 6;

    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final EventVisitRepository eventVisitRepository;
    private final UserRepository userRepository;

    public RecommendationService(BookingRepository bookingRepository, EventRepository eventRepository,
                                 EventVisitRepository eventVisitRepository, UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.eventRepository = eventRepository;
        this.eventVisitRepository = eventVisitRepository;
        this.userRepository = userRepository;
    }

    public List<RecommendedEventResponse> recommendForUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found");
        }

        List<Interaction> bookingHistory = bookingInteractions(bookingRepository.findAll());
        List<Interaction> visitHistory = visitInteractions(eventVisitRepository.findAll());
        boolean hasBookingHistory = bookingHistory.stream().anyMatch(item -> item.userId().equals(userId));

        // If this user has no reservations, learn exclusively from event visits.
        List<Interaction> trainingData = hasBookingHistory
                ? mergeInteractions(bookingHistory, visitHistory)
                : visitHistory;
        Set<Long> excludedEventIds = consumedEventIds(userId, bookingHistory, visitHistory);

        List<Event> candidates = eventRepository.findAll().stream()
                .filter(this::isRecommendable)
                .filter(event -> !excludedEventIds.contains(event.getId()))
                .toList();
        if (candidates.isEmpty()) {
            return List.of();
        }

        Map<Long, Integer> userIndexes = indexUsers(trainingData, userId);
        Map<Long, Integer> eventIndexes = indexEvents(trainingData, candidates);
        BiasedMatrixFactorization model = new BiasedMatrixFactorization(
                userIndexes.size(), eventIndexes.size(), LATENT_FACTORS,
                toIndexedInteractions(trainingData, userIndexes, eventIndexes)
        );

        Map<Long, Long> popularity = popularity(trainingData);
        int currentUserIndex = userIndexes.get(userId);
        return candidates.stream()
                .map(event -> new ScoredEvent(
                        event.getId(),
                        model.predict(currentUserIndex, eventIndexes.get(event.getId())),
                        popularity.getOrDefault(event.getId(), 0L)
                ))
                .sorted(Comparator.comparingDouble(ScoredEvent::score).reversed()
                        .thenComparing(ScoredEvent::popularity, Comparator.reverseOrder()))
                .limit(MAX_RECOMMENDATIONS)
                .map(event -> new RecommendedEventResponse(event.eventId(), event.score()))
                .toList();
    }

    private boolean isRecommendable(Event event) {
        return event.getStatus() == EventStatus.PUBLISHED
                && event.getStartDateTime() != null
                && event.getStartDateTime().isAfter(LocalDateTime.now());
    }

    private List<Interaction> bookingInteractions(List<Booking> bookings) {
        List<Interaction> interactions = new ArrayList<>();
        for (Booking booking : bookings) {
            if (booking.getBookingStatus() == BookingStatus.CANCELLED
                    || booking.getAttendee() == null || booking.getEvent() == null) {
                continue;
            }
            Long userId = booking.getAttendee().getId();
            Long eventId = booking.getEvent().getId();
            if (userId != null && eventId != null) {
                interactions.add(new Interaction(userId, eventId, 0.75));
            }
        }
        return interactions;
    }

    private List<Interaction> visitInteractions(List<EventVisit> visits) {
        return visits.stream()
                .filter(visit -> visit.getAttendee() != null && visit.getEvent() != null)
                .filter(visit -> visit.getAttendee().getId() != null && visit.getEvent().getId() != null)
                .map(visit -> new Interaction(visit.getAttendee().getId(), visit.getEvent().getId(), 1.0))
                .toList();
    }

    private List<Interaction> mergeInteractions(List<Interaction> first, List<Interaction> second) {
        Map<String, Interaction> byPair = new HashMap<>();
        for (Interaction interaction : first) {
            byPair.put(interaction.userId() + ":" + interaction.eventId(), interaction);
        }
        for (Interaction interaction : second) {
            String key = interaction.userId() + ":" + interaction.eventId();
            byPair.merge(key, interaction,
                    (oldValue, newValue) -> oldValue.value() >= newValue.value() ? oldValue : newValue);
        }
        return new ArrayList<>(byPair.values());
    }

    private Set<Long> consumedEventIds(Long userId, List<Interaction> bookingHistory, List<Interaction> visitHistory) {
        Set<Long> eventIds = new HashSet<>();
        bookingHistory.stream().filter(item -> item.userId().equals(userId)).forEach(item -> eventIds.add(item.eventId()));
        visitHistory.stream().filter(item -> item.userId().equals(userId)).forEach(item -> eventIds.add(item.eventId()));
        return eventIds;
    }

    private Map<Long, Integer> indexUsers(List<Interaction> interactions, Long requestedUserId) {
        Set<Long> ids = new HashSet<>();
        ids.add(requestedUserId);
        interactions.forEach(interaction -> ids.add(interaction.userId()));
        return createIndex(ids);
    }

    private Map<Long, Integer> indexEvents(List<Interaction> interactions, List<Event> candidates) {
        Set<Long> ids = new HashSet<>();
        candidates.forEach(event -> ids.add(event.getId()));
        interactions.forEach(interaction -> ids.add(interaction.eventId()));
        return createIndex(ids);
    }

    private Map<Long, Integer> createIndex(Set<Long> ids) {
        Map<Long, Integer> indexes = new HashMap<>();
        int index = 0;
        for (Long id : ids) {
            indexes.put(id, index++);
        }
        return indexes;
    }

    private List<IndexedInteraction> toIndexedInteractions(List<Interaction> interactions,
                                                             Map<Long, Integer> userIndexes,
                                                             Map<Long, Integer> eventIndexes) {
        return interactions.stream()
                .map(interaction -> new IndexedInteraction(
                        userIndexes.get(interaction.userId()), eventIndexes.get(interaction.eventId()), interaction.value()))
                .toList();
    }

    private Map<Long, Long> popularity(List<Interaction> interactions) {
        Map<Long, Long> counts = new HashMap<>();
        interactions.forEach(interaction -> counts.merge(interaction.eventId(), 1L, Long::sum));
        return counts;
    }

    private record Interaction(Long userId, Long eventId, double value) { }
    private record IndexedInteraction(int userIndex, int eventIndex, double value) { }
    private record ScoredEvent(Long eventId, double score, long popularity) { }

    /** SGD implementation of μ + bu + bi + pu·qi. */
    private static final class BiasedMatrixFactorization {
        private static final double LEARNING_RATE = 0.02;
        private static final double REGULARIZATION = 0.03;

        private final double mean;
        private final double[] userBias;
        private final double[] eventBias;
        private final double[][] userFactors;
        private final double[][] eventFactors;

        BiasedMatrixFactorization(int userCount, int eventCount, int factors, List<IndexedInteraction> interactions) {
            mean = interactions.stream().mapToDouble(IndexedInteraction::value).average().orElse(0.0);
            userBias = new double[userCount];
            eventBias = new double[eventCount];
            userFactors = randomMatrix(userCount, factors, new Random(42));
            eventFactors = randomMatrix(eventCount, factors, new Random(84));
            train(interactions);
        }

        private double[][] randomMatrix(int rows, int columns, Random random) {
            double[][] matrix = new double[rows][columns];
            for (int row = 0; row < rows; row++) {
                for (int column = 0; column < columns; column++) {
                    matrix[row][column] = random.nextGaussian() * 0.01;
                }
            }
            return matrix;
        }

        private void train(List<IndexedInteraction> interactions) {
            List<IndexedInteraction> shuffled = new ArrayList<>(interactions);
            Random random = new Random(7);
            for (int epoch = 0; epoch < EPOCHS; epoch++) {
                Collections.shuffle(shuffled, random);
                for (IndexedInteraction interaction : shuffled) {
                    int user = interaction.userIndex();
                    int event = interaction.eventIndex();
                    double error = interaction.value() - predict(user, event);
                    userBias[user] += LEARNING_RATE * (error - REGULARIZATION * userBias[user]);
                    eventBias[event] += LEARNING_RATE * (error - REGULARIZATION * eventBias[event]);

                    for (int factor = 0; factor < userFactors[user].length; factor++) {
                        double userFactor = userFactors[user][factor];
                        double eventFactor = eventFactors[event][factor];
                        userFactors[user][factor] += LEARNING_RATE * (error * eventFactor - REGULARIZATION * userFactor);
                        eventFactors[event][factor] += LEARNING_RATE * (error * userFactor - REGULARIZATION * eventFactor);
                    }
                }
            }
        }

        double predict(int user, int event) {
            double prediction = mean + userBias[user] + eventBias[event];
            for (int factor = 0; factor < userFactors[user].length; factor++) {
                prediction += userFactors[user][factor] * eventFactors[event][factor];
            }
            return prediction;
        }
    }
}
