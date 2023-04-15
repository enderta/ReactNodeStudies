import React from 'react';
import Navbar from "../components/Navbar";
import {Form} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPaperPlane} from "@fortawesome/free-solid-svg-icons";
import Button from "react-bootstrap/Button";

const Edit = (props) => {
    //get id from url
    const id = window.location.pathname.split("/")[2];
    const [title, setTitle] = React.useState("");
    const [content, setContent] = React.useState("");
    const [author, setAuthor] = React.useState("");
    const [image_url, setImage_url] = React.useState("");
    const [post, setPost] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

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
                    setPost(data.data.rows[0]);
                    setAuthor(data.data.rows[0].author);
                    setTitle(data.data.rows[0].title);
                    setContent(data.data.rows[0].content);
                    setImage_url(data.data.rows[0].image_url);
                    setLoading(false);
                })
                .catch((err) => console.log(err));
        }
        , [])
    console.log(post)
    //use put endpoint to update the post
    const handleUpdate = (e) => {
        e.preventDefault();
        setLoading(true);
        fetch(`http://localhost:5000/blog/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: localStorage.getItem("token"),
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
            },
            body: JSON.stringify({
                title: title,
                content: content,
                author: author,
                image_url: image_url

            })
        })
            .then(res => res.json())
            .then(data => {
                    setLoading(false);
                    console.log(data);
                }
            )

            .catch((err) => console.log(err));
        setTitle("");
        setContent("");
        setAuthor("");
        window.location.href = "/home";
    }


    const handleTitle = (e) => {
        e.preventDefault();
        setTitle(e.target.value);
    }
    const handleContent = (e) => {
        e.preventDefault();
        setContent(e.target.value);
    }
    const handleAuthor = (e) => {
        e.preventDefault();
        setAuthor(e.target.value);
    }
    const handleImage_url = (e) => {
        e.preventDefault();
        setImage_url(e.target.value);
    }


    return (
        <div>
            <Navbar/>
            {
                loading  ? <h5 style={{color: "goldenrod", textAlign: "center"}}>loading...</h5> :(

                    <div className="container">
                        <div>
                            <h1 style={{color: "goldenrod", textAlign: "center"}}>Edit post</h1>
                        </div>
                        <div className="row">
                            <div className="col-md-12">

                                <form onSubmit={handleUpdate}>
                                    <div className="form-group">
                                        <label htmlFor="title">Title</label>
                                        <input type="text" className="form-control" id="title" value={title}  onChange={handleTitle}/>
                                        <div className="form-group">
                                            <label htmlFor="content">Content</label>
                                            <textarea className="form-control" id="content" value={content} rows="3"
                                                      onChange={handleContent}></textarea>
                                            <div className="form-group">
                                                <label htmlFor="author">Author</label>
                                                <input type="text" className="form-control" value={author} id="author"
                                                       onChange={handleAuthor}/>
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="image_url">Image url</label>
                                                <input type="text" className="form-control" value={image_url} id="image_url"
                                                         onChange={handleImage_url}/>
                                            </div>
                                        </div>
                                    </div>
                                    <br/>
                                    <Button type="submit" variant={"outline-warning"}>
                                        <FontAwesomeIcon  icon={faPaperPlane}/>
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }

        </div>
    );
};

export default Edit;