import {useState} from "react";

export default function CreateUser() {
    const [message, setMessage] = useState('');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMessage('Creating user...');

        const formData = new FormData(event.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(`http://localhost:8080/api/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                setMessage('User created successfully!');
            } else {
                setMessage('Failed to create user. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('There was a problem communicating with the server.');
        }
    };

    return (
    <div>
            <h1>Create User</h1>
            <form onSubmit={handleSubmit}>
            <label>User id:</label>   
            <input type="text" name="userId" required /> 
            <label>First name:</label>
            <input type="text" name="firstName" required />
            <label>Last name:</label>
            <input type="text" name="lastName" required />
            <label>Email:</label>
            <input type="email" name="email" required />
            <label>Password:</label>
            <input type="password" name="password" required />
            <label>Phone:</label>
            <input type="text" name="phone" required />
            <label>Address:</label>
            <input type="text" name="address" required />
            <label>TIN</label>
            <input type="text" name="tin" required />
            <label>Role:</label>
            <select name="role" required>
                <option value="USER">User</option>
                <option value="ORGANISER">Admin</option>
            </select>
            <button type="submit">Create User</button>
        </form>
        {message && <p>{message}</p>}
    </div>
  );
}