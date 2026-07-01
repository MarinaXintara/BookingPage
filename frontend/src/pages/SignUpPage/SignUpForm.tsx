import React from "react";
import { useForm } from "react-hook-form";
import "../../App.css";  // Updated path assuming App.css is in src/
import "./SignUpForm.css";  // Assuming this file exists in the same folder

interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    checkPassword: string;
    phoneNumber?: string;
    address?: string;
    tin?: string;
}

const Register: React.FC = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<FormData>();

    const password = watch("password");

    const onSubmit = (data: FormData) => {
        const userData = {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
            checkPassword: data.checkPassword,
            phoneNumber: data.phoneNumber,
            address: data.address,
            tin: data.tin,
        };
        console.log("Registering user: ", userData)
        fetch("http://localhost:8080/api/auth/register", {
            method: "POST",
            body: JSON.stringify(userData),
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
            <h2>Registration Form</h2>
            <form className="App" onSubmit={handleSubmit(onSubmit)}>
                <input
                    type="text"
                    {...register("firstName", { required: "*First name is mandatory" })}
                    placeholder="First Name"
                />
                {errors.firstName && <span className="error">{errors.firstName.message}</span>}

                <input
                    type="text"
                    {...register("lastName", { required: "*Last name is mandatory" })}
                    placeholder="Last Name"
                />
                {errors.lastName && <span className="error">{errors.lastName.message}</span>}

                <input
                    type="email"
                    {...register("email", { required: "*Email is mandatory", pattern: { value: /^\S+@\S+$/i, message: "Invalid email" } })}
                    placeholder="Email"
                />
                {errors.email && <span className="error">{errors.email.message}</span>}

                <input
                    type="password"
                    {...register("password", { required: "*Password is mandatory", minLength: { value: 6, message: "Password must be at least 6 characters" } })}
                    placeholder="Password"
                />
                {errors.password && <span className="error">{errors.password.message}</span>}

                <input
                    type="password"
                    {...register("checkPassword", { required: "*Please confirm password", validate: value => value === password || "Passwords do not match" })}
                    placeholder="Confirm Password"
                />
                {errors.checkPassword && <span className="error">{errors.checkPassword.message}</span>}

                <input
                    type="tel"
                    {...register("phoneNumber")}
                    placeholder="Phone Number"
                />

                <input
                    type="text"
                    {...register("address")}
                    placeholder="Address"
                />

                <input
                    type="text"
                    {...register("tin")}
                    placeholder="TIN"
                />

                <button type="submit">Register</button>
            </form>
        </>
    );
};

export default Register;
