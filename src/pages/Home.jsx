import React from 'react'
import Navbar from "../components/Navbar";
import Single from "./Single";
import {Link} from "react-router-dom";

function Home() {
    const [posts, setPosts] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    // Fetch posts from API endpoint blog and use auth token from local storage
    React.useEffect(() => {
        fetch("http://localhost:5000/blog", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: localStorage.getItem("token"),
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
            }
        })
            .then(res => res.json())
            .then(data => {
                setPosts(data.data.rows);
                setLoading(false);
            })
            .catch((err) => console.log(err));
    }, [])
    console.log(posts)
    console.log(localStorage)
    return (
        <div>
            <Navbar/>
           {/* // Display all posts on grid cards usin react-bootstrap*/}
            <div className="container">
                <div className="row">
                    <div className="col-md-12">
                        <h1 style={{color: "goldenrod", textAlign: "center"}}>Posts</h1>
                        {loading ? <h5 style={{color: "goldenrod", textAlign: "center"}}>loading...</h5> : (
                            <div className="row">
                                {posts.map((post) => (
                                    <div className="col-md-4">
                                        <div className="card" style={{width: "18rem"}}>
                                            <div className="card-body">
                                                <h5 className="card-title">{post.title}</h5>
                                                <h6 className="card-subtitle mb-2 text-muted">{post.author}</h6>
                                                <Single id={post.id}/>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    )
}

export default Home
