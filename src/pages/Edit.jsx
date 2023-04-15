import React from 'react';
import Navbar from "../components/Navbar";
import {Form} from "react-bootstrap";

const Edit = (props) => {
    //get id from url
    const id = window.location.pathname.split("/")[2];
    const [title, setTitle] = React.useState("");
    const [content, setContent] = React.useState("");
    const [author, setAuthor] = React.useState("");
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
                    setPost(data.data);
                    setTitle(data.data.blog_post.title);
                    setContent(data.data.blog_post.content);
                    setAuthor(data.data.blog_post.author);
                    setLoading(false);
                })
                .catch((err) => console.log(err));
        }
        , []);
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


    return (
        <div>
            <Navbar/>
            <div className="container">
                <div className="row">
                    <div className="col-md-12">
                        <h1>Edit Post</h1>
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
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary">Submit</button>
                        </form>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Edit;