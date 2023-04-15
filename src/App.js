import React from 'react';
import {Outlet, Route, Routes} from "react-router-dom";

import Single from "./pages/Single";
import Home from "./pages/Home";
import Write from "./pages/Write";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import Logout from "./components/Logout";
import Read from "./pages/Read";


const App = () => {
    return (
        <div>

            <Routes>
                <Route path={"/"} element={<Login/>}/>
                <Route path={"/register"} element={<Register/>}/>
                <Route path={"/login"} element={<Login/>}/>
                <Route path={"/home"} element={<Home/>}/>
                <Route path={"/write"} element={<Write/>}/>
                <Route path={"/post/:postId"} element={<Read/>}/>
                <Route path="/logout" element={<Logout/>}/>
            </Routes>

        </div>
    );
};

export default App;