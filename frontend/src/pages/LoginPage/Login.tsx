import React from "react";
import {useForm} from "react-hook-form";
import "../../App.css";
import "./Login.css";

interface LoginData {
    email: string;
    password: string;
}

const Login: React.FC = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginData>();


    const onSubmit = (data: LoginData) => {


        // dummy user login
        if (data.email === "user@dummy.com" && data.password === "user123") {
            localStorage.setItem("isLoggedIn", "true");
            // navigate to protected home page after successful login
            window.location.href = "/home";
            return;
        }

        // TODO: send request to backend for authentication
        alert("Email or Password does not match our records.");

    };

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
                <button type="submit">Login</button>
            </form>
        </>
    );
};

export default Login;