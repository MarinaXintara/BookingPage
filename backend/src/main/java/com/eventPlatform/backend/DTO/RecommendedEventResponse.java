package com.eventPlatform.backend.DTO;

/** A ranked event recommendation; score is relative, not a rating. */
public record RecommendedEventResponse(Long eventId, double score) {
}
