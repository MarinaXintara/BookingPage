package com.eventPlatform.backend.DTO;

/**
 * A ranked event recommendation.  The score is relative to the other results
 * returned for the same user and is not a user-facing rating.
 */
public record RecommendedEventResponse(Long eventId, double score) {
}
