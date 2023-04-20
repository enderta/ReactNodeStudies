import React from 'react';

const Logout = () => {
    const logout = () => {
        localStorage.clear();
        localStorage.removeItem("token");
        localStorage.removeItem("name");
        localStorage.removeItem("email");
        localStorage.removeItem("role");
        window.location.href = "/login";
    }
    return (
        <div>
            <a onClick={logout}></a>
        </div>
    );
};

export default Logout;