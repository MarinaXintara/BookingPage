import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../Auth/useAuth.ts';

export function PrivateRoute() {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <p aria-live="polite">Checking session...</p>;
    }

    return user ? (
        <Outlet />
    ) : (
        <Navigate
            to="/login"
            replace
            state={{ from: location }} // remember original page
        />
    );
}
