import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { PrivateRoute } from './components/PrivateRoute.tsx';

import Layout from './Layout.tsx';
import BookingPage from './pages/BookingPage/BookingPage.tsx';
import EventDetailsPage from './pages/EventDetailsPage/EventDetails.tsx';
import EventPage from './pages/EventPage/EventPage.tsx';
import { Home } from './pages/HomePage/Home.tsx';
import Login from "./pages/LoginPage/Login.tsx";
import Messaging from './pages/Messaging/Messaging.tsx';
import Registration from "./pages/SignUpPage/SignUpForm.tsx";
import UserDetailsPage from './pages/UserDetailsPage/UserDetailsPage.tsx';
import UsersPage from './pages/UsersPage/UsersPage.tsx';
import Welcome from './pages/WelcomePage/Welcome.tsx';
import CreateEvent from './pages/OrganiseEvent/CreateEvent.tsx';
import EditEvent from './pages/OrganiseEvent/EditEvent.tsx';
import DeleteButton from './pages/OrganiseEvent/DeleteEvent.tsx'; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route element={<Layout />}>

          <Route path="/" element={<Welcome />} />
          {/* <Route element={<PrivateRoute />}> */}
          <Route path="/home" element={<Home />} />
          {/* </Route> */}
          <Route path="/events" element={<EventPage />} />
          <Route path="/events/:eventId" element={<EventDetailsPage />} />
          <Route path="/booking/:eventId" element={<BookingPage />} />
          <Route path="/chat" element={<Messaging />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/:userId" element={<UserDetailsPage />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/edit-event/:eventId" element={<EditEvent eventId={''} />} />
          <Route path="/delete-event/:eventId" element={<DeleteButton eventId={''} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
