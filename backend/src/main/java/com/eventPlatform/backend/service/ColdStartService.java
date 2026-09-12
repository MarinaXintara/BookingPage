package com.eventPlatform.backend.service;

import com.eventPlatform.backend.DTO.Interaction;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static java.lang.Math.sqrt;

@Service
public class ColdStartService {

    private final MatrixFactorizationService matrixFactorizationService;

    public ColdStartService(MatrixFactorizationService matrixFactorizationService) {
        this.matrixFactorizationService = matrixFactorizationService;
    }

    public List<Double> createUserProfile(Long userId) {

        List<Double> userProfile = new ArrayList<>();

        for (int i = 0; i < 100; i++) {
            userProfile.add(0.0);
        }

        List<Interaction> interactions = matrixFactorizationService.getUserInteractions(userId);

        List<Long> eventIds = new ArrayList<>();

        for (Interaction interaction : interactions) {
            eventIds.add(interaction.getEventId());
        }

        Map<Long, List<Double>> eventFeaturesMap = matrixFactorizationService.getEventFeatures(eventIds);

        System.out.println(
                "COLD START -> userId = " + userId +
                        ", interactions = " + interactions.size()
        );

        int interactionCount = 0;

        for (Interaction interaction : interactions) {

            Long eventId = interaction.getEventId();
            double weight = interaction.getPreference();

            List<Double> eventFeatures = eventFeaturesMap.get(eventId);

            if (eventFeatures.size() != 100) {
                continue;
            }

            for (int i = 0; i < 100; i++) {

                userProfile.set(
                        i,
                        userProfile.get(i)
                                + weight * eventFeatures.get(i)
                );
            }

            interactionCount++;
        }

        if (interactionCount == 0) {
            return userProfile;
        }

        for (int i = 0; i < 100; i++) {

            userProfile.set(
                    i,
                    userProfile.get(i) / interactionCount
            );
        }

        return userProfile;
    }

    public List<Double> getEventFeatures(Long eventId) {
        return matrixFactorizationService.getEventFeatures(eventId);
    }


    public double calculateColdStartScore(List<Double> userProfile, List<Double> eventFeatures) {
        if (eventFeatures.size() != 100) {
            return 0.0;
        }

        double dotProduct = 0.0;
        double userMagnitude = 0.0;
        double eventMagnitude = 0.0;

        for (int i = 0; i < 100; i++) {
            dotProduct += userProfile.get(i) * eventFeatures.get(i);
            userMagnitude += userProfile.get(i) * userProfile.get(i);
            eventMagnitude += eventFeatures.get(i) * eventFeatures.get(i);
        }

        userMagnitude = Math.sqrt(userMagnitude);
        eventMagnitude = Math.sqrt(eventMagnitude);

        if (userMagnitude == 0.0 || eventMagnitude == 0.0) {
            return 0.0;
        }

        return dotProduct / (userMagnitude * eventMagnitude);
    }


}
