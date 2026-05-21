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
        fetch("http://localhost:8080/api/auth/login", {
            method: "POST",
            body: JSON.stringify(data),
            headers: {"Content-Type": "application/json"}})
            .then(response => {
                console.log(response);
            if (response.ok) {
                window.location.assign('/home')
            }
        })
        .catch(error => console.log(error));
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
                <button type="submit">Login</button>
            </form>
        </>
    );
};

export default Login;