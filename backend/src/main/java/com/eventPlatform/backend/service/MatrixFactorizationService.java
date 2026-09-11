package com.eventPlatform.backend.service;

import com.eventPlatform.backend.DTO.Interaction;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.Random;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MatrixFactorizationService {

    private Map<Long, Integer> userIndex = new HashMap<>();
    private Map<Long, Integer> eventIndex = new HashMap<>();

    private int factors = 20;

    private double[][] userFactors;
    private double[][] eventFactors;

    private double[] userBias;
    private double[] eventBias;

    private double globalBias;



    private void createIndexes(List<Interaction> interactions) {

        int userCounter = 0;
        int eventCounter = 0;

        for (Interaction interaction : interactions) {

            Long userId = interaction.getUserId();
            Long eventId = interaction.getEventId();

            if (!userIndex.containsKey(userId)) {
                userIndex.put(userId, userCounter);
                userCounter++;
            }

            if (!eventIndex.containsKey(eventId)) {
                eventIndex.put(eventId, eventCounter);
                eventCounter++;
            }
        }
    } //περναω ολα τα interactions και δημιουργω maps

    public List<Interaction> loadTrainingData() {

        List<Interaction> interactions = new ArrayList<>();

        try {
            InputStream inputStream = getClass()
                    .getClassLoader()
                    .getResourceAsStream("recommender/event_interest.csv");

            if (inputStream == null) {
                throw new RuntimeException("event_interest.csv not found");
            }

            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(inputStream)
            );
            reader.readLine();
            String line;
            while ((line = reader.readLine()) != null) {

                String[] values = line.split(",");

                Long userId = Long.parseLong(values[0]);
                Long eventId = Long.parseLong(values[1]);

                int interested = Integer.parseInt(values[4]);
                int notInterested = Integer.parseInt(values[5]);

                double preference;

                if (interested == 1) {
                    preference = 1.0;
                }
                else if (notInterested == 1) {
                    preference = -1.0;
                }
                else {
                    continue;
                }

                Interaction interaction = new Interaction();
                interaction.setUserId(userId);
                interaction.setEventId(eventId);
                interaction.setPreference(preference);

                interactions.add(interaction);
            }

            reader.close();

        } catch (IOException e) {
            throw new RuntimeException("Error loading training data", e);
        }

        return interactions;
    } //περναω τα data απο τα csv σε List με Interactions DTO


//    public buildInteractions(){}

    private void initializeModel() {

        int numberOfUsers = userIndex.size();
        int numberOfEvents = eventIndex.size();

        userFactors = new double[numberOfUsers][factors];
        eventFactors = new double[numberOfEvents][factors];

        userBias = new double[numberOfUsers];
        eventBias = new double[numberOfEvents];

        Random random = new Random();

        for (int u = 0; u < numberOfUsers; u++) {
            for (int k = 0; k < factors; k++) {
                userFactors[u][k] = random.nextDouble() * 0.1;
            }
        }

        for (int i = 0; i < numberOfEvents; i++) {
            for (int k = 0; k < factors; k++) {
                eventFactors[i][k] = random.nextDouble() * 0.1;
            }
        }
    }

//    public train(){}

//    public predict(Long userId, Long eventId){}

}

