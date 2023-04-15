import React from 'react'
import Navbar from "../components/Navbar";
import Button from "react-bootstrap/Button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPaperPlane} from "@fortawesome/free-solid-svg-icons";

function Write() {
    const [title, setTitle] = React.useState("");
    const [content, setContent] = React.useState("");
    const [author, setAuthor] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        fetch("http://localhost:5000/blog", {
            method: "POST",
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
            })
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
                        <h1 style={{color: "goldenrod", textAlign: "center"}}>Write a post</h1>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="title">Title</label>
                                <input type="text" className="form-control" id="title" onChange={handleTitle}/>
                                <div className="form-group">
                                    <label htmlFor="content">Content</label>
                                    <textarea className="form-control" id="content" rows="3"
                                              onChange={handleContent}></textarea>
                                    <div className="form-group">
                                        <label htmlFor="author">Author</label>
                                        <input type="text" className="form-control" id="author"
                                               onChange={handleAuthor}/>
                                    </div>
                                </div>
                            </div>
                            <br/>
                            <Button type="submit" variant={"outline-warning"}>
                                <FontAwesomeIcon  icon={faPaperPlane}/>
                            </Button>
                        </form>
                        {loading ?  <h5 style={{color: "goldenrod", textAlign: "center"}}>loading...</h5> : null}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Write
