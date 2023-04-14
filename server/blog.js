const express = require("express");
const app = express();
const cors = require("cors");
const {Pool} = require("pg");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {check, validationResult} = require("express-validator");
const {query} = require("express");
const secret = "secret";

app.use(cors());
app.use(express.json());

pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "blog",
    password: "ender",
    port: 5432,
});

// register user
app.post(
    "/register",
    [
        check("email", "Please include a valid email").isEmail(),
        check(
            "password",
            "Please enter a password with 6 or more characters"
        ).isLength({min: 6}),
        check("username", "Please enter a name").isLength({min: 1}),
        //is_admin is a boolean value should be false default
        check("is_admin", "Please enter a boolean value").isBoolean(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        const {email, password, username, is_admin} = req.body;

        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const result = await pool.query("SELECT * FROM users WHERE email = $1", [
                email,
            ]);
            if (result.rows.length > 0) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: "User already exists" }] });
            }
            const query = "INSERT INTO users (email, password, username, is_admin) VALUES ($1, $2, $3, $4) RETURNING *";
            const values = [email, hashedPassword, username, is_admin];
            await pool.query(query, values);
            res.status(201).json({
                message: "User created",
                data: {
                    email,
                    password,
                },
            });
        } catch (err) {
            //eslint-disable-next-line
            console.error(err);
            res.status(500).json({ errors: [{ msg: "Server error" }] });
        }
    }

);

// login user
app.post(
    "/login",
    [
        check("email", "Please include a valid email").isEmail(),
        check("password", "Password is required").exists(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        const {email, password} = req.body;

        try {
            const {rows} = await pool.query(
                "SELECT * FROM users WHERE email = $1",
                [email]
            );
            if (rows.length === 0) {
                return res.status(400).json({
                    errors: [{msg: "Invalid credentials"}],
                });
            }
            const isMatch = await bcrypt.compare(password, rows[0].password);
            if (!isMatch) {
                return res.status(400).json({
                    errors: [{msg: "Invalid credentials"}],
                });
            }
            const token = jwt.sign(
                {
                    user: {
                        id: rows[0].id,
                        email: rows[0].email,
                        username: rows[0].username,
                        is_admin: rows[0].is_admin,
                    },
                },
                secret,
                {expiresIn: "1h"}
            );
            res.status(200).json({
                status: "success",
                message: "User logged in",
                data: {
                    token,
                    is_admin: rows[0].is_admin,
                },
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server error");
        }
    }
);

// get all users
app.get("/users", async (req, res) => {
    //only admin can get all users
    jwt.verify(req.headers.authorization, secret, async (error, decoded) => {
            if (error) {
                res.status(401).json({error: "Unauthorized"});
            } else {
                if (!decoded.user.is_admin) {
                    res.status(401).json({error: "Unauthorized"});
                    return;
                }
                try {
                    const {rows} = await pool.query("SELECT * FROM users");
                    res.status(200).json({
                        status: "success",
                        message: "All users",
                        data: {
                            users: rows,
                        },
                    });
                } catch (err) {
                    console.error(err.message);
                    res.status(500).send("Server error");
                }
            }
        }
    );
});

// get a user
app.get("/users/:id", async (req, res) => {
    //only admin can get a user
    jwt.verify(req.headers.authorization, secret, async (error, decoded) => {
            if (error) {
                res.status(401).json({error: "Unauthorized"});
            } else {
                if (!decoded.user.is_admin) {
                    res.status(401).json({error: "Unauthorized"});
                    return;
                }
                try {
                    const {rows} = await pool.query(
                        "SELECT * FROM users WHERE id = $1",
                        [req.params.id]
                    );
                    res.status(200).json({
                        status: "success",
                        message: "User",
                        data: {
                            user: rows[0],
                        },
                    });
                } catch (err) {
                    console.error(err.message);
                    res.status(500).send("Server error");
                }
            }
        }
    );
});

// update a user
app.put("/users/:id", async (req, res) => {
    //only admin can update a user
    jwt.verify(req.headers.authorization, secret, async (error, decoded) => {
        if (error) {
            res.status(401).json({error: "Unauthorized"});
        } else {
            if (!decoded.user.is_admin) {
                res.status(401).json({error: "Unauthorized"});
                return;
            }
            const {username, email,password,is_admin} = req.body;
            try {
                const {rows} = await pool.query(
                    "UPDATE users SET username = $1, email = $2, password = $3, is_admin = $4 WHERE id = $5 RETURNING *",
                    [username, email, password, is_admin, req.params.id]
                );
                res.status(200).json({
                    status: "success",
                }
            );
            } catch (err) {
                console.error(err.message);
                res.status(500).send("Server error");
            }
        }
    });
});

// delete a user

app.delete("/users/:id", async (req, res) => {
    //only admin can delete a user
    jwt.verify(req.headers.authorization, secret, async (error, decoded) => {
        if (error) {
            res.status(401).json({error: "Unauthorized"});
        } else {
            if (!decoded.user.is_admin) {
                res.status(401).json({error: "Unauthorized"});
                return;
            }
            try {
                const {rows} = await pool.query(
                    "DELETE FROM users WHERE id = $1",
                    [req.params.id]
                );
                res.status(200).json({
                    status: "success",
                    message: "User deleted",
                });
            } catch (err) {
                console.error(err.message);
                res.status(500).send("Server error");
            }
        }
    });
});


// create a blog post
app.post(
    "/blog",
    [
        check("title", "Please enter a title").isLength({min: 1}),
        check("content", "Please enter some content").isLength({min: 1}),
        check("author", "Please enter an author").isLength({min: 1}),
    ],
    async (req, res) => {
        //only admin can create a blog post
        jwt.verify(req.headers.authorization, secret, async (error, decoded) => {
            if (error) {
                res.status(401).json({error: "Unauthorized"});
            } else {
                if (!decoded.user.is_admin) {
                    res.status(401).json({error: "Unauthorized"});
                    return;
                }
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({errors: errors.array()});
                }
                const {title, content, author} = req.body;
                try {
                    const {rows} = await pool.query(
                        "INSERT INTO blog_posts (title, content, author) VALUES ($1, $2, $3) RETURNING *",
                        [title, content, author]
                    );
                    res.status(201).json({
                        status: "success",
                        message: "Blog post created",
                        data: {
                            id: rows[0].id,
                            title: rows[0].title,
                            content: rows[0].content,
                        }
                    });
                } catch (err) {
                    console.error(err.message)
                    res.status(500).send("Server error");

                }
            }
        });
    });

// get all blog posts
app.get("/blog", async (req, res) => {
      jwt.verify(req.headers.authorization, secret, async (error, decoded) => {
          if (error) {
              res.status(401).json({error: "Unauthorized"});
          } else {
              try {
                  const {rows} = await pool.query("SELECT * FROM blog_posts");
                  res.status(200).json({
                      status: "success",
                      message: `${rows.length} blog posts found`,
                        data: {
                          rows
                        }
                  });
              } catch (err) {
                  console.error(err.message);
                  res.status(500).send("Server error");
              }
          }
        });
    }
);

// get a blog post
app.get("/blog/:id", async (req, res) => {
       jwt.verify(req.headers.authorization, secret, async (error, decoded) => {
              if (error) {
                res.status(401).json({error: "Unauthorized"});
              } else {
                try {
                     const {rows} = await pool.query(
                          "SELECT * FROM blog_posts WHERE id = $1",
                          [req.params.id]
                     );
                     if (rows.length === 0) {
                          return res.status(404).json({
                            status: "error",
                            message: "Blog post not found",
                          });
                     }
                     res.status(200).json({
                          status: "success",
                          message: "Blog post",
                          data: {
                            blog_post: rows[0],
                          },
                     });
                } catch (err) {
                     console.error(err.message);
                     res.status(500).send("Server error");
                }
              }
          });
       }
);

// update a blog post
app.put("/blog/:id", async (req, res) => {
    //only admin can update a blog post
    jwt.verify(req.headers.authorization, secret, async (error, decoded) => {
            if (error) {
                res.status(401).json({error: "Unauthorized"});
            } else {
                if (!decoded.user.is_admin) {
                    res.status(401).json({error: "Unauthorized"});
                    return;
                }
                const {title, content, author} = req.body;
                try {
                    const {rows} = await pool.query(
                        "UPDATE blog_posts SET title = $1, content = $2, author = $3 WHERE id = $4 RETURNING *",
                        [title, content, author, req.params.id]
                    );
                    if (rows.length === 0) {
                        return res.status(404).json({
                            status: "error",
                            message: "Blog post not found",
                        });
                    }
                    res.status(200).json({
                        status: "success",
                        message: "Blog post updated",
                        data: rows[0],
                    });
                } catch (err) {
                    console.error(err.message);
                    res.status(500).send("Server error");
                }
            }
        }
    );
});

// delete a blog post

app.delete("/blog/:id", async (req, res) => {
    //only admin can delete a blog post
    jwt.verify(req.headers.authorization, secret, async (error, decoded) => {
        if (error) {
            res.status(401).json({error: "Unauthorized"});
        } else {
            if (!decoded.user.is_admin) {
                res.status(401).json({error: "Unauthorized"});
                return;
            }
            try {
                const {rows} = await pool.query(
                    "DELETE FROM blog_posts WHERE id = $1 RETURNING *",
                    [req.params.id]
                );
                if (rows.length === 0) {
                    return res.status(404).json({
                        status: "error",
                        message: "Blog post not found",
                    });
                }
                res.status(200).json({
                    status: "success",
                    message: "Blog post deleted",
                    data: rows[0],
                });
            } catch (err) {
                console.error(err.message);
                res.status(500).send("Server error");
            }
        }
    });
});

app.listen(5000, () => {
    console.log("Server is listening on port 5000");
});
