Αλλαγές:
    Backend
    1. Έφτιαξα το event ώστε να μπορεί να δεχτεί αλλαγές από admin και να μπορεί να δημιουργηθεί όπως οι users.
        Μόνος περιορισμός δεν εχώ φτιαξει ακόμα να μπορεί να κανει edit τους organisers,tickettypes,booking
    2. Έφτιαξα τα bookings ώστε να μπορουν δημιουργηθούν μέσω φόρμας όπως οι users.
        Μένει να φτίαξω το patch ώστε να μπορεί ο admin να τα κάνει edit
    3. Έφτιαξα το γεγονός οτι δεν έπαιρνε η βάση το role σε κάθε register

    ToDo:
    1.Το booking controller με το createBooking να θέτει bookingStatus ως PENDING.
    Να υπάρχει editBooking και να κάνει το status CONFIRMED. Το deleteBooking  να επιστρέφει CANCELLED.
    2.Το event controller για το createEvent να αποθηκεύει status DRAFT. Xρειάζεται στη συνάρτηση editEvent  να γυρναει PUBLISHED.
    Όταν περάσει η ημερομηνία της εκδήλωσης , η εκδήλωση θα γίνει COMPLETED,oπότε υποθέτω γίνεται σε υποσυνάρτηση της editEvent.Τέλος, οταν ακυρωθεί η εκδήλωση το deleteEvent να γυρνάει CANCELLED.
    3.Να μειώνονται τα εισιτήρια σε κάθε κράτηση. Αν ο χρήστης επιλέξει παραπάνω εισιτήρια από τα διαθέσιμα να μη καλείται createBooking.
    4.Δες το authentication στο backend με τους ρόλους. Ρίξε μια ματία στο PrivateRoute.tsx του frontend. Έχω εναν πίνακα που συνδέει paths με ROLES.
    5.Messaging. MessagingController: endopoint : (/send) :PostMapping για αποστολή μηνυμάτων, 
    ({id}/read/):PutMapping για μαρκάρισμα διαβασμένων μηνυμάτων
    ("/{id}):deleleMapping για διαγραφή μηνυμάτων

