import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";

const Register = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleInputChange = (e) => {
        e.preventDefault();
        const { name, value } = e.target;
        if (name === "username") {
            setUsername(value);
        }
        if (name === "email") {
            setEmail(value);
        }
        if (name === "password") {
            setPassword(value);
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const user = {
            username,
            email,
            password,
            role: "user"
        }
        fetch("https://blogapi-786t.onrender.com/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user)
        })
        .then(res => res.json())
        .then(data => {
            if (data.message === "User created") {
                window.location.href = "/login";
            } else if (data.errors[0].msg=== "User already exists") {
                alert("User already exists");
            } else {
                alert("Fill in all fields");
            }
        })
        .catch((err) => console.log(err));
    };

    const handleBack = (e) => {
        e.preventDefault();
        window.location.href = "/";
    };
    console.log()

    return (
        <div>
            <div>
                <div>
                    <h1 style={{ color: "goldenrod", textAlign: "center" }}>Register</h1>
                </div>

                <div className="container">
                    <div className="row">
                        <div className="col-md-6 mt-5 mx-auto">
                            <Form style={{ width: "50%", margin: "auto" }}>
                                <Form.Group controlId="formBasicEmail">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter username"
                                        name="username"
                                        value={username}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                                <Form.Group controlId="formBasicEmail">
                                    <Form.Label>Email address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Enter email"
                                        name="email"
                                        value={email}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                                <Form.Group controlId="formBasicPassword">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Password"
                                        name="password"
                                        value={password}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>

                                <Button
                                    variant="outline-success"
                                    style={{ margin: "10px" }}
                                    type="submit"
                                    onClick={handleSubmit}

                                >
                                    Register
                                </Button>
                                <Button
                                    variant="outline-success"
                                    style={{ margin: "10px" }}
                                    type="submit"
                                    onClick={handleBack}
                                >
                                    Login
                                </Button>
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
