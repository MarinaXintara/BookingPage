import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PrivateRoute } from './components/PrivateRoute.tsx';

import Welcome from './pages/WelcomePage/Welcome.tsx';
import Login from "./pages/LoginPage/Login.tsx";
import Registration from "./pages/SignUpPage/SignUpForm.tsx";
import { Home } from './pages/HomePage/Home.tsx';
import EventPage from './pages/EventPage/EventPage.tsx';
import EventDetailsPage from './pages/EventDetailsPage/EventDetails.tsx';
import BookingPage from './pages/BookingPage/bookingPage.tsx';
import BookingChat from './pages/Chat/Chat.tsx';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />

        <Route element={<PrivateRoute />}>
          <Route path="/home" element={<Home />} />
        </Route>
        <Route path="/events" element={<EventPage />} />
        <Route path="/events/:eventId" element={<EventDetailsPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/chat" element={<BookingChat />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;