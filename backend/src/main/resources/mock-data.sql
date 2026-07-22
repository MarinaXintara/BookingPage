-- Mock development data for the BookingPage backend.
--
-- Load into the project's configured PostgreSQL database with:
--   $env:PGPASSWORD='postgres'; & 'C:\Program Files\PostgreSQL\18\bin\psql.exe' -h localhost -U postgres -d my-postgres -f backend\src\main\resources\mock-data.sql
--
-- Run this after the backend has started at least once, so Hibernate has created
-- the tables from the JPA entities.

BEGIN;

TRUNCATE TABLE bookings, ticket_types, events, users RESTART IDENTITY CASCADE;

INSERT INTO users
    (id, first_name, last_name, email, password, phone_number, address, tin, role)
VALUES
    (1, 'Admin', 'User', 'admin@example.com', '$2a$10$NLWScgZiOq4CsLIHVD12BuIhapphzJKHL8UCWQHjpgZZHPxVuHG5q', '+30 210 000 0001', '1 Admin Street, Athens', '100000001', 'ADMIN'),
    (2, 'Olivia', 'Papadopoulos', 'organizer@example.com', 'password123', '+30 210 000 0002', '25 Event Avenue, Athens', '100000002', 'ORGANIZER'),
    (3, 'Nikos', 'Georgiou', 'nikos@example.com', 'password123', '+30 210 000 0003', '9 Ermou Street, Athens', '100000003', 'USER'),
    (4, 'Maria', 'Ioannou', 'maria@example.com', 'password123', '+30 210 000 0004', '14 Tsimiski Street, Thessaloniki', '100000004', 'USER');

INSERT INTO events
    (id, title, category, event_type, venue, address, city, country, latitude, longitude, start_date_time, end_date_time, capacity, status, description, organizer_id)
VALUES
    (
        1,
        'Athens Tech Summit 2026',
        'Technology',
        'Conference',
        'Megaron Athens International Conference Centre',
        'Vasilissis Sofias Avenue, Athens',
        'Athens',
        'Greece',
        37.9814,
        23.7548,
        '2026-09-18 09:00:00',
        '2026-09-18 18:00:00',
        350,
        'PUBLISHED',
        'A one-day technology conference with talks, workshops, and networking for software teams.',
        2
    ),
    (
        2,
        'Thessaloniki Food Walk',
        'Food',
        'Tour',
        'Modiano Market',
        'Vasileos Irakleiou 33, Thessaloniki',
        'Thessaloniki',
        'Greece',
        40.6359,
        22.9424,
        '2026-08-07 18:30:00',
        '2026-08-07 22:00:00',
        60,
        'PUBLISHED',
        'A guided evening tasting route through local vendors and traditional street food spots.',
        2
    ),
    (
        3,
        'Online Product Design Workshop',
        'Design',
        'Workshop',
        'Online',
        'Remote',
        'Online',
        'Greece',
        NULL,
        NULL,
        '2026-10-03 11:00:00',
        '2026-10-03 15:00:00',
        120,
        'DRAFT',
        'A remote workshop covering practical product design critique, flows, and prototyping.',
        2
    );

INSERT INTO ticket_types
    (id, name, price, quantity, available, event_id)
VALUES
    (1, 'General Admission', 49.00, 250, 248, 1),
    (2, 'Student', 19.00, 70, 69, 1),
    (3, 'VIP', 129.00, 30, 30, 1),
    (4, 'Standard Tasting', 35.00, 50, 48, 2),
    (5, 'Premium Tasting', 55.00, 10, 9, 2),
    (6, 'Remote Seat', 25.00, 120, 120, 3);

INSERT INTO bookings
    (id,attendee_id, time,ticket_type_ref, number_of_tickets, total_cost, booking_status, ticket_type_id)
VALUES
    (1, 3, '2026-06-27 12:00:00',T1, 2, 98.00, 'CONFIRMED', 1),
    (2, 4, '2026-06-27 12:15:00', T2,1, 19.00, 'PENDING', 2),
    (3, 3, '2026-06-27 12:30:00',T3, 2, 70.00, 'CONFIRMED', 4),
    (4, 4, '2026-06-27 12:45:00', T4,1, 55.00, 'CANCELLED', 5,);

SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE((SELECT MAX(id) FROM users), 1), true);
SELECT setval(pg_get_serial_sequence('events', 'id'), COALESCE((SELECT MAX(id) FROM events), 1), true);
SELECT setval(pg_get_serial_sequence('ticket_types', 'id'), COALESCE((SELECT MAX(id) FROM ticket_types), 1), true);
SELECT setval(pg_get_serial_sequence('bookings', 'id'), COALESCE((SELECT MAX(id) FROM bookings), 1), true);

COMMIT;
