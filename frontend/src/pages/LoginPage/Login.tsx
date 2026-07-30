import React from "react";
import {useForm} from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../Auth/useAuth.ts";
import "../../App.css";
import "./Login.css";

interface LoginData {
    email: string;
    password: string;
}

const Login: React.FC = () => {
    const { user, loading, login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const redirectPath =
        (location.state as { from?: { pathname?: string } } | null)
            ?.from?.pathname ?? "/home";
    const [submitError, setSubmitError] = React.useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginData>();


    React.useEffect(() => {
        if (!loading && user) {
            navigate(redirectPath, { replace: true });
        }
    }, [loading, navigate, redirectPath, user]);

    const onSubmit = async (data: LoginData) => {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            await login(data);
        } catch (error) {
            setSubmitError(
                error instanceof Error ? error.message : "Could not log in"
            );
        } finally {
            setIsSubmitting(false);
        }
    }
    

    return (
        <>
            <h2>Login Form</h2>
            <form className="App" onSubmit={handleSubmit(onSubmit)}>
                <input
                    type="email"
                    {...register("email", { required: "*Email is mandatory" })}
                    placeholder="Email"
                />
                {errors.email && <span className="error">{errors.email?.message}</span>}
                <input
                    type="password"
                    {...register("password", { required: "*Password is mandatory" })}
                    placeholder="Password"
                />
                {errors.password && <span className="error">{errors.password?.message}</span>}
                {submitError && <span className="error" role="alert">{submitError}</span>}
                <button type="submit" disabled={loading || isSubmitting}>
                    {loading
                        ? "Checking session..."
                        : isSubmitting
                          ? "Logging in..."
                          : "Login"}
                </button>
            </form>
        </>
    );
};

export default Login;
