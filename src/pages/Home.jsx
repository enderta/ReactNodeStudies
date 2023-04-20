import React from 'react'
import Navbar from "../components/Navbar";
import Single from "./Single";
import {Link} from "react-router-dom";
import {faSearch} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

function Home() {
    const [posts, setPosts] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [search, setSearch] = React.useState("");

// Fetch posts from API endpoint blog and use auth token from local storage
    React.useEffect(() => {
//search for posts
        fetch(`http://localhost:5000/blog?search=${search}`, {
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
                }
            )
            .catch((err) => console.log(err));
    }, [search])

    return (
        <div>
            <Navbar search={setSearch}/>
            <div>
                <FontAwesomeIcon icon={faSearch} color={'goldenRod'} style={{margin: "5px"}}/>
                <input
                    type="text"
                    placeholder="Search"
                    onChange={(e) => {
                        setSearch(e.target.value);
                    }}
                />
            </div>
            <div className="container">
                <div className="row">
                    <div className="col-md-12">
                        <h1 style={{color: "goldenrod", textAlign: "center"}}>Posts</h1>
                        {loading ? <h5 style={{color: "goldenrod", textAlign: "center"}}>loading...</h5> : (
                            <div className="row">
                                {posts.map((post) => (
                                    <div className="col-md-4">
                                        <div className="card" style={{height: "30rem", width: "18rem", margin: "5px"}}>
                                            <img className={"card-img-top"} src={post.image_url} alt="Card image cap"/>
                                            <div className="card-body">
                                                <h6 className="card-title mb-2 text-muted">Title: {post.title}</h6>
                                                <h6 className="card-subtitle mb-2 text-muted">Author: {post.author}</h6>
                                                <p>
                                                    {post.content.length > 100 ? post.content.substring(0, 100) + "..." : post.content}
                                                </p>
                                            </div>
                                            <span style={{margin: "5px"}}>
                                                <Single id={post.id}/>
                                            </span>
                                            <br/>
                                            <h6 className="card-subtitle mb-2 text-muted">
                                                Posted: {new Date(post.created_at).toLocaleDateString()}
                                            </h6>
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
