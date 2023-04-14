import React from 'react';
import {NavLink} from "react-router-dom";

const Navbar = () => {
    return (
        <div>
         <nav>
             <nav>
                 <ul>
                     <li>
                         <NavLink exact to="/">Home</NavLink>
                     </li>
                     <li>
                         <NavLink to="/write">Write</NavLink>
                     </li>
                     <li>
                         <NavLink to="/register">Register</NavLink>
                     </li>
                     <li>
                         <NavLink to="/login">Login</NavLink>
                     </li>
                 </ul>
             </nav>
         </nav>
        </div>
    );
};

export default Navbar;