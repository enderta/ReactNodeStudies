import React from 'react';

const Footer = () => {
    return (
        <div>
            //footer should be end of the page
            <footer className="footer">
                <div className="container">
                    <div className="row">
                        <div className="col-md-4">
                            <h3>Blog</h3>
                            <p>Blog is a website where you can write your own blogs and read other people's blogs.</p>
                        </div>
                        <div className="col-md-4">
                            <h3>Links</h3>
                            <ul className="list-unstyled">
                                <li><a href="/home">Home</a></li>
                                <li><a href="/write">Write</a></li>
                                <li><a href="/login">Login</a></li>
                                <li><a href="/register">Register</a></li>
                            </ul>
                        </div>
                        <div className="col-md-4">
                            <h3>Follow Us</h3>
                            <ul className="list-unstyled">
                                <li><a href="https://www.facebook.com/">Facebook</a></li>
                                <li><a href="https://twitter.com/">Twitter</a></li>
                                <li><a href="https://www.instagram.com/">Instagram</a></li>
                                <li><a href="https://www.youtube.com/">Youtube</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                </footer>
        </div>
    );
};

export default Footer;