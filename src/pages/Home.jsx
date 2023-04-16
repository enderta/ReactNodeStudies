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
                //sort the posts by date created_at in descending order
                data.data.rows.sort((a, b) => {
                    return new Date(b.created_at) - new Date(a.created_at);
                }
                )
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
                                            <img className={"card-img-top"} src={post.image_url}  alt="Card image cap"/>
                                            <div className="card-body">
                                                <h6 className="card-title mb-2 text-muted">Title: {post.title}</h6>
                                                <h6 className="card-subtitle mb-2 text-muted">Author: {post.author}</h6>
                                                <p>
                                                    {post.content.length > 100 ? post.content.substring(0, 100) + "..." : post.content}
                                                </p>
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
