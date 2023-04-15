import React from 'react';
import Navbar from "../components/Navbar";

const Read = () => {
    //get the id from the url
    const id = window.location.pathname.split("/")[2];
    console.log(id)
    const [post, setPost] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    // Fetch posts from API endpoint blog and use auth token from local storage
    //and take the reader to the single post page
    React.useEffect(() => {
            fetch(`http://localhost:5000/blog/${id}`, {
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
                    setPost(data.data);
                    setLoading(false);
                })
                .catch((err) => console.log(err));
        }
        , [])
    console.log(post)
    const handleDelete = () => {
        fetch(`http://localhost:5000/blog/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: localStorage.getItem("token"),
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
            }
        })
            .then(res => res.json())
            .then(data => {
                console.log(data)
                window.location.href = "/home"
            })
            .catch((err) => console.log(err));
    }
    const handleEdit = () => {
        window.location.href = `/edit/${id}`
    }

    return (

        <div>
            <Navbar/>
            <div className="container">
                <div className="row">
                    <div className="col-md-12">
                        <h5 style={{color: "goldenrod", textAlign: "center"}}>Post</h5>
                        {loading ? <h5 style={{color: "goldenrod", textAlign: "center"}}>loading...</h5> : (
                            <div>
                                <div className="card" style={{width: "18rem"}}>
                                    <div className="card-body">
                                        <h5 className="card-title">{post.blog_post.title}</h5>
                                        <h6 className="card-subtitle mb-2 text-muted">{post.blog_post.author}</h6>
                                        <p className="card-text">{post.blog_post.content}</p>
                                        {
                                            (localStorage.getItem("is_admin") === "true") ? (
                                                    <div>
                                                        <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
                                                        <button className="btn btn-warning" onClick={handleEdit}>Edit</button>
                                                    </div>
                                                ) : (
                                                    <div></div>
                                                )
                                        }
                                    </div>
                                </div>
                            </div>
                        )}
                </div>
            </div>
            </div>
        </div>
    );
};

export default Read;