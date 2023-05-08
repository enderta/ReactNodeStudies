import React from 'react';
import {Route, Routes} from "react-router-dom";
import Home from './pages/Home'
import Write from "./pages/Write";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Logout from "./components/Logout";
import Read from "./pages/Read";
import Edit from "./pages/Edit";

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
                <Route path={"/edit/:postId"} element={<Edit/>}/>
            </Routes>
        </div>
    );
};

export default App;