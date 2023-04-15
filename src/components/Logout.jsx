import React from 'react';
import Button from "react-bootstrap/Button";

const Logout = () => {
    const logout = () => {
        localStorage.clear();
        localStorage.removeItem("token");
        localStorage.removeItem("name");
        localStorage.removeItem("email");
        window.location.href = "/login";
    }
    return (
        <div>
            <a onClick={logout} ></a>
        </div>
    );
};

export default Logout;