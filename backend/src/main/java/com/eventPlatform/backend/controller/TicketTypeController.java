package com.eventPlatform.backend.controller;

import com.eventPlatform.backend.entity.TicketType;
import com.eventPlatform.backend.service.TicketTypeService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tickets")
public class TicketTypeController {

    private final TicketTypeService ticketTypeService;

    public TicketTypeController(TicketTypeService ticketTypeService) {
        this.ticketTypeService = ticketTypeService;
    }

    @PostMapping("/event/{eventId}")
    public TicketType addTicketType(@PathVariable Long eventId, @RequestBody TicketType ticketType) {
        return ticketTypeService.addTicketTypeToEvent(eventId, ticketType);
    }
}