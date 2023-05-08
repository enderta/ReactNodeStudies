import React from 'react';
import Navbar from "../components/Navbar";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEdit, faTrashAlt} from "@fortawesome/free-solid-svg-icons";
import Button from "react-bootstrap/Button";

const Read = () => {
    //get the id from the url
    const id = window.location.pathname.split("/")[2];
    console.log(id)
    const [post, setPost] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    // Fetch posts from API endpoint blog and use auth token from local storage
    //and take the reader to the single post page
    React.useEffect(() => {
            fetch(`https://blogapi-786t.onrender.com/blog/${id}`, {
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
                    setPost(data.data.rows[0]);
                    setLoading(false);
                })
                .catch((err) => console.log(err));
        }
        , [])
    console.log(post)
    const handleDelete = () => {
        fetch(`https://blogapi-786t.onrender.com/blog/${id}`, {
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
                        <h1 style={{color: "goldenrod", textAlign: "center"}}>{post.title}</h1>
                        {loading ? <h5 style={{color: "goldenrod", textAlign: "center"}}>loading...</h5> : (
                            <div>
                                {
                                    (localStorage.getItem("role") === "admin") ? (
                                        <div className="d-flex justify-content-end">
                                            <Button style={{margin:"1px"}} variant={"outline-danger"}  onClick={handleDelete}>
                                                <FontAwesomeIcon icon={faTrashAlt} />
                                            </Button>
                                            <Button variant={"outline-info"}  onClick={handleEdit}>
                                                <FontAwesomeIcon icon={faEdit} />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div></div>
                                    )
                                }
                            </div>
                        )}
                        <br/>
                            <div>
                                <div >
                                    <div >
                                        <div style={{ whiteSpace: "pre-wrap" , wordWrap: "break-word", wordBreak: "break-word" }}>
                                            {post.content}
                                        </div>
                                        <br/>
                                        <div>
                                            <h6 className="card-subtitle mb-2 text-muted">{post.author}</h6>
                                        </div>
                                        <br/>
                                    </div>
                                    <img className={"card-img-top"} src={post.image_url} style={{height:"400px",width:"600px"}} alt="Card image cap"/>

                                </div>
                            </div>
                </div>
            </div>
            </div>
        </div>
    );
};

export default Read;