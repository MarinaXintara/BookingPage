// PrivateRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export const PrivateRoute: React.FC = () => {
    const userIsSignedIn = localStorage.getItem('isLoggedIn') === 'true';
    const location = useLocation();

    // If logged in, render child routes; otherwise redirect to /login
    return userIsSignedIn ? (
        <Outlet />
    ) : (
        <Navigate
            to="/login"
            replace
            state={{ from: location }} // remember original page
        />
    );
};
